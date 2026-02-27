import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractFrame } from '@/trigger/extract-frame-task';
import { cropImage } from '@/trigger/crop-image-task';
import { runLLM } from '@/trigger/llm-task';
import { runs } from '@trigger.dev/sdk/v3';

export const maxDuration = 60; // Allow maximum execution time on Vercel Hobby

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

    // Execute synchronously to prevent Vercel from killing the background process
    await executeWorkflow(workflowRun.id, nodes, edges);

    const updatedRun = await prisma.workflowRun.findUnique({
      where: { id: workflowRun.id }
    });

    return NextResponse.json({ runId: workflowRun.id, status: updatedRun?.status || 'COMPLETED' });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 });
  }
}

// Helper to poll with timeout so Vercel doesn't hang indefinitely 
// if Trigger.dev tasks are not deployed to production.
async function pollWithTimeout(runId: string, timeoutMs: number = 45000) {
  const pollPromise = runs.poll(runId);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Trigger.dev task timed out. Make sure you run `npx trigger.dev deploy` to deploy tasks to production!')), timeoutMs)
  );
  return Promise.race([pollPromise, timeoutPromise]) as Promise<any>;
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

            const frameRun = await extractFrame.trigger({
              videoUrl: sourceResult.output.videoUrl,
              timestamp: node.data.timestamp || '0',
            });

            const frameResult = await pollWithTimeout(frameRun.id);

            if (frameResult.status !== 'COMPLETED' || !frameResult.output?.success) {
              throw new Error('Trigger.dev frame extraction failed');
            }

            output = {
              extractedFrameUrl: (frameResult.output as any).extractedFrameUrl,
              imageUrl: (frameResult.output as any).extractedFrameUrl // Also provide imageUrl for compatibility with other nodes
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

            const cropRun = await cropImage.trigger({
              imageUrl: sourceResult.output.imageUrl,
              xPercent: node.data.xPercent || 0,
              yPercent: node.data.yPercent || 0,
              widthPercent: node.data.widthPercent || 100,
              heightPercent: node.data.heightPercent || 100,
            });

            const cropResult = await pollWithTimeout(cropRun.id);

            if (cropResult.status !== 'COMPLETED' || !cropResult.output?.success) {
              throw new Error('Trigger.dev image crop failed');
            }

            output = {
              imageUrl: (cropResult.output as any).croppedUrl,
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

            const llmRun = await runLLM.trigger({
              model: selectedModel,
              systemPrompt: systemPrompt,
              userMessage: mergedMessage,
              images: inputImage ? [inputImage.url] : undefined,
            });

            const llmResult = await pollWithTimeout(llmRun.id);

            if (llmResult.status !== 'COMPLETED' || !llmResult.output?.success) {
              throw new Error('Trigger.dev LLM task failed');
            }

            output = {
              response: (llmResult.output as any).response,
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
