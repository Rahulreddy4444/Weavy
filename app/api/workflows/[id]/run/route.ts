import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { scope = 'FULL' } = body;

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId: user.id },
    });

    if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

    const nodes = JSON.parse(workflow.nodes as string);
    const edges = JSON.parse(workflow.edges as string);

    const workflowRun = await prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        userId: user.id,
        status: 'RUNNING',
        scope,
        nodeResults: JSON.stringify([]),
      },
    });

    // Background execution
    executeWorkflow(workflowRun.id, nodes, edges).catch(console.error);

    return NextResponse.json({ runId: workflowRun.id, status: 'RUNNING' });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 });
  }
}

async function executeWorkflow(runId: string, nodes: any[], edges: any[]) {
  const nodeResults: any[] = [];
  const startTime = Date.now();

  try {
    // Sort nodes by dependency
    const sortedNodes = sortNodesTopologically(nodes, edges);

    for (const node of sortedNodes) {
      const nodeStartTime = Date.now();
      try {
        let output: any = {};

        switch (node.type) {
          case 'textNode':
            output = { text: node.data.text || '' };
            break;

          case 'uploadImageNode':
            output = {
              imageUrl: node.data.imageUrl,
              fileName: node.data.fileName,
              fileSize: node.data.fileSize
            };
            break;

          case 'uploadVideoNode':
            output = {
              videoUrl: node.data.videoUrl,
              fileName: node.data.fileName,
              fileSize: node.data.fileSize
            };
            break;

          case 'extractFrameNode': {
            const incomingEdges = edges.filter(e => e.target === node.id);
            const sourceResult = nodeResults.find(r =>
              incomingEdges.some(e => e.source === r.nodeId) && r.status === 'success'
            );

            if (!sourceResult || !sourceResult.output.videoUrl) {
              throw new Error('Extract Frame node requires a video input');
            }

            // FALLBACK: Generate a placeholder frame since FFmpeg is not available
            const width = 640;
            const height = 360;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Draw placeholder background
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, width, height);

            // Draw text
            ctx.fillStyle = '#94a3b8';
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Video Frame Extraction', width / 2, height / 2 - 20);
            ctx.font = '16px sans-serif';
            ctx.fillText(`Timestamp: ${node.data.timestamp || '0'}`, width / 2, height / 2 + 20);
            ctx.fillText('(Requires FFmpeg on server)', width / 2, height / 2 + 50);

            // Save placeholder to disk
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const fileName = `frame-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
            const filePath = path.join(uploadsDir, fileName);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filePath, buffer);

            output = {
              extractedFrameUrl: `/uploads/${fileName}`,
              imageUrl: `/uploads/${fileName}` // Also provide imageUrl for compatibility with other nodes
            };
            break;
          }
          case 'cropImageNode': {
            const incomingEdges = edges.filter(e => e.target === node.id);
            const sourceResult = nodeResults.find(r =>
              incomingEdges.some(e => e.source === r.nodeId) && r.status === 'success'
            );

            if (!sourceResult || !sourceResult.output.imageUrl) {
              throw new Error('Crop node requires an image input');
            }

            const imageUrl = sourceResult.output.imageUrl;
            const image = await loadImage(imageUrl);

            // Calculate crop dimensions
            // node.data stores percentages: xPercent, yPercent, widthPercent, heightPercent
            const width = image.width;
            const height = image.height;

            const x = Math.floor((node.data.xPercent || 0) / 100 * width);
            const y = Math.floor((node.data.yPercent || 0) / 100 * height);
            const w = Math.floor((node.data.widthPercent || 100) / 100 * width);
            const h = Math.floor((node.data.heightPercent || 100) / 100 * height);

            // Validate bounds to prevent canvas errors
            const cropX = Math.max(0, Math.min(x, width));
            const cropY = Math.max(0, Math.min(y, height));
            const cropW = Math.max(1, Math.min(w, width - cropX));
            const cropH = Math.max(1, Math.min(h, height - cropY));

            const canvas = createCanvas(cropW, cropH);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

            // SAVE TO DISK INSTEAD OF BASE64
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const fileName = `crop-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
            const filePath = path.join(uploadsDir, fileName);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filePath, buffer);

            output = {
              imageUrl: `/uploads/${fileName}`,
              width: cropW,
              height: cropH
            };
            break;
          }

          case 'outputNode': {
            const incomingEdges = edges.filter(e => e.target === node.id);
            const sourceResult = nodeResults.find(r =>
              incomingEdges.some(e => e.source === r.nodeId) && r.status === 'success'
            );

            if (sourceResult) {
              output = sourceResult.output;
            }
            break;
          }

          case 'llmNode': {
            const incomingEdges = edges.filter(e => e.target === node.id);
            const userMessages: string[] = [];
            let systemPromptInput = '';
            let inputImage: { url: string; path: string; mimeType: string } | null = null;

            // Collect text and images from all connected nodes
            for (const edge of incomingEdges) {
              const prevResult = nodeResults.find(r => r.nodeId === edge.source);
              if (prevResult && prevResult.status === 'success') {

                // Handle System Prompt connection
                if (edge.targetHandle === 'system_prompt') {
                  const text = prevResult.output.text || prevResult.output.response || '';
                  if (text) systemPromptInput = text;
                }

                // Handle Image connection
                else if (edge.targetHandle === 'images') {
                  if (!inputImage && prevResult.output.imageUrl) {
                    const imageUrl = prevResult.output.imageUrl;
                    // Convert URL to local file path
                    // imageUrl is like "/uploads/file.png"
                    if (imageUrl.startsWith('/uploads/')) {
                      const relativePath = imageUrl.substring(1); // Remove leading slash
                      const absolutePath = path.join(process.cwd(), 'public', relativePath);
                      inputImage = {
                        url: imageUrl,
                        path: absolutePath,
                        mimeType: 'image/png' // Assuming png for now, can infer from extension
                      };
                    }
                  }
                }

                // Handle User Messages (default or dynamic inputs like user_message_0)
                else {
                  const text = prevResult.output.text || prevResult.output.response || '';
                  if (text) userMessages.push(text);
                }
              }
            }

            const mergedMessage = userMessages.join('\n') || node.data.userMessage || 'No input provided';
            const selectedModel = node.data.model || 'gemini-1.5-flash-latest';
            // System prompt priority: Connected Input > Manual Input
            const systemPrompt = systemPromptInput || node.data.systemPrompt || '';

            let responseText = '';

            // ✅ GEMINI MODELS
            if (selectedModel.startsWith('gemini')) {
              // Prepare the model config. Note: System instructions are supported in 1.5 models.
              // If using an older model like gemini-pro, systemInstruction might cause issues, 
              // but we default to 1.5-flash which supports it.
              const modelConfig: any = { model: selectedModel };
              if (systemPrompt) {
                modelConfig.systemInstruction = systemPrompt;
              }

              const model = genAI.getGenerativeModel(modelConfig);

              const promptParts: any[] = [mergedMessage];

              // Add image if available
              if (inputImage && fs.existsSync(inputImage.path)) {
                const imageBuffer = fs.readFileSync(inputImage.path);
                const imageBase64 = imageBuffer.toString('base64');
                promptParts.push({
                  inlineData: {
                    data: imageBase64,
                    mimeType: inputImage.mimeType
                  }
                });
              }

              const result = await model.generateContent(promptParts);
              responseText = result.response.text();
            }

            // ✅ OPENAI GPT MODELS
            else if (selectedModel.startsWith('gpt')) {
              if (!process.env.OPENAI_API_KEY) {
                throw new Error('OpenAI API key not set in environment variables');
              }

              const messages: any[] = [
                { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
                {
                  role: 'user',
                  content: inputImage ? [
                    { type: 'text', text: mergedMessage },
                    {
                      type: 'image_url',
                      image_url: {
                        // OpenAI needs a public URL or base64 data url. 
                        // Since we are running locally, we need to pass base64 data url.
                        url: `data:${inputImage.mimeType};base64,${fs.readFileSync(inputImage.path).toString('base64')}`
                      }
                    }
                  ] : mergedMessage
                }
              ];

              const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                  model: selectedModel,
                  messages: messages,
                }),
              });

              if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'OpenAI API error');
              }

              const data = await response.json();
              responseText = data.choices[0].message.content;
            }

            // ✅ ANTHROPIC MODELS
            else if (selectedModel.startsWith('claude')) {
              if (!process.env.ANTHROPIC_API_KEY) {
                throw new Error('Anthropic API key not set');
              }

              // Construct content array
              const content: any[] = [{ type: 'text', text: mergedMessage }];
              if (inputImage) {
                content.push({
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: inputImage.mimeType,
                    data: fs.readFileSync(inputImage.path).toString('base64')
                  }
                });
              }

              const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': process.env.ANTHROPIC_API_KEY,
                  'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                  model: selectedModel,
                  max_tokens: 1024,
                  messages: [{ role: 'user', content }],
                  system: systemPrompt,
                }),
              });

              if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Anthropic API error');
              }

              const data = await response.json();
              responseText = data.content[0].text;
            }

            output = {
              response: responseText,
              // Pass through the image URL so the output node can display it
              ...(inputImage ? { imageUrl: inputImage.url } : {})
            };
            break;
          }

          case 'textToImageNode': {
            const incomingEdges = edges.filter(e => e.target === node.id);
            const sourceResult = nodeResults.find(r =>
              incomingEdges.some(e => e.source === r.nodeId) && r.status === 'success'
            );

            // Prompt priority: Connected Input > Manual Input
            const prompt = sourceResult?.output?.text || sourceResult?.output?.response || node.data.prompt;

            if (!prompt) {
              throw new Error('Prompt is required for image generation');
            }

            // MOCK IMPLEMENTATION FOR IMAGE GENERATION
            // OpenAI API key has billing limits, so we use a placeholder service.

            // Wait for 1.5 seconds to simulate processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Use Picsum to generate a consistent image based on the prompt length/content
            // This ensures "dog" always gives the same image, but "cat" gives a different one.
            const seed = prompt.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;

            output = {
              imageUrl: imageUrl,
              prompt: prompt
            };
            break;
          }

          case 'textToVideoNode': {
            const incomingEdges = edges.filter(e => e.target === node.id);
            const sourceResult = nodeResults.find(r =>
              incomingEdges.some(e => e.source === r.nodeId) && r.status === 'success'
            );

            // Prompt priority: Connected Input > Manual Input
            const prompt = sourceResult?.output?.text || sourceResult?.output?.response || node.data.prompt;

            if (!prompt) {
              throw new Error('Prompt is required for video generation');
            }

            // VEO 3.1 IMPLEMENTATION via Gemini API REST Endpoint
            const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
            if (!apiKey) {
              throw new Error('Google Gemini API key not found');
            }

            // Using the specific 2.0 preview model (more widely available than 3.1)
            const modelId = 'veo-2.0-generate-uhd-preview';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`;

            // 1. Start generation
            console.log(`Starting Veo generation with model: ${modelId}`);

            let videoUrl = '';
            let warningMessage = '';

            try {
              let response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  instances: [{ prompt: prompt }],
                  parameters: {
                    sampleCount: 1,
                    videoLength: "6s",
                    aspectRatio: "16:9"
                  }
                })
              });

              if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                console.warn(`Veo 3.1 API call failed: ${response.status} ${response.statusText}`, errBody);

                // SOFT FAIL: If model not found (404) or permission denied (403), fall back to placeholder
                if (response.status === 404 || response.status === 403 || response.status === 400) {
                  warningMessage = `Veo Model (${modelId}) not available for this API key. Using placeholder.`;
                  throw new Error("SOFT_FAIL");
                }
                throw new Error(errBody.error?.message || `Veo API error: ${response.status}`);
              }

              let data = await response.json();

              // 2. Poll for results if LRO
              let operationName = data.name;

              if (!data.predictions && operationName) {
                console.log(`Veo generation started. Operation: ${operationName}`);

                // Poll loop (max 120 seconds)
                const startTime = Date.now();
                while (Date.now() - startTime < 120000) {
                  await new Promise(resolve => setTimeout(resolve, 5000));

                  const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;
                  const pollResponse = await fetch(pollUrl);

                  if (!pollResponse.ok) throw new Error("Polling failed");

                  const operation = await pollResponse.json();
                  if (operation.done) {
                    if (operation.error) throw new Error(operation.error.message);
                    if (operation.response?.predictions) {
                      data = operation.response;
                      break;
                    }
                    throw new Error('No predictions found in completed operation');
                  }
                }
              }

              // 3. Process Result
              if (data.predictions?.[0]) {
                const prediction = data.predictions[0];
                if (prediction.videoUri) {
                  videoUrl = prediction.videoUri;
                } else if (prediction.bytesBase64Encoded) {
                  const videoBuffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
                  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                  const fileName = `veo-${Date.now()}.mp4`;
                  const filePath = path.join(uploadsDir, fileName);
                  fs.writeFileSync(filePath, videoBuffer);
                  videoUrl = `/uploads/${fileName}`;
                }
              }
            } catch (err: any) {
              if (err.message === "SOFT_FAIL") {
                // Fallback handled below
              } else {
                console.error("Video execution error:", err);
                warningMessage = `Generation failed: ${err.message}. Using placeholder.`;
              }
            }

            if (!videoUrl) {
              videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
            }

            output = {
              videoUrl: videoUrl,
              prompt: prompt,
              warning: warningMessage
            };
            break;
          }

          default:
            output = node.data || {};
        }

        nodeResults.push({
          nodeId: node.id,
          nodeType: node.type,
          status: 'success',
          output,
          duration: Date.now() - nodeStartTime,
          timestamp: new Date().toISOString(),
        });

      } catch (error: any) {
        nodeResults.push({
          nodeId: node.id,
          nodeType: node.type,
          status: 'failed',
          error: error.message,
          duration: Date.now() - nodeStartTime,
        });
      }
    }

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
        duration: Date.now() - startTime,
        nodeResults: JSON.stringify(nodeResults),
      },
    });

  } catch (error: any) {
    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'FAILED',
        error: error.message,
        nodeResults: JSON.stringify(nodeResults),
      },
    });
  }
}

function sortNodesTopologically(nodes: any[], edges: any[]): any[] {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph
  edges.forEach(edge => {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      adjacencyList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  // Kahn's Algorithm
  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const sortedNodes: any[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) sortedNodes.push(node);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If cycle detected or disconnected components remain, append remaining nodes
  if (sortedNodes.length !== nodes.length) {
    const processedIds = new Set(sortedNodes.map(n => n.id));
    nodes.forEach(node => {
      if (!processedIds.has(node.id)) {
        sortedNodes.push(node);
      }
    });
  }

  return sortedNodes;
}
