import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createCanvas, loadImage } from 'canvas';

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
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
    // Note: In a production app, you should sort 'nodes' by dependency (Topological Sort)
    for (const node of nodes) {
      const nodeStartTime = Date.now();
      try {
        let output: any = {};

        switch (node.type) {
          case 'textNode':
            output = { text: node.data.text || '' };
            break;

        case 'llmNode': {
          const incomingEdges = edges.filter(e => e.target === node.id);
          const incomingTexts: string[] = [];

          // 1. Collect text from all connected nodes (e.g., your two Text Nodes)
          for (const edge of incomingEdges) {
            const prevResult = nodeResults.find(r => r.nodeId === edge.source);
            if (prevResult && prevResult.status === 'success') {
              const text = prevResult.output.text || prevResult.output.response || '';
              incomingTexts.push(text);
            }
          }

          // 2. Merge the texts into one message
          const mergedMessage = incomingTexts.join('\n') || node.data.userMessage || "No input provided";

          // 3. Use a confirmed working model (Gemini 1.5 Flash or 2.5 Flash)
          const model = genAI.getGenerativeModel({ 
            model: node.data.model || 'gemini-1.5-flash',
            systemInstruction: node.data.systemPrompt // Use the prompt you wrote in the UI
          });

          const result = await model.generateContent(mergedMessage);
          const response = await result.response;
          output = { response: response.text() };
          break;
        }

  

        // case 'llmNode': {
        //     const incomingEdges = edges.filter(e => e.target === node.id);
        //     const parts: any[] = [];
        //     let sourceImageUrl = '';

        //     for (const edge of incomingEdges) {
        //       const prevResult = nodeResults.find(r => r.nodeId === edge.source);
        //       if (prevResult && prevResult.status === 'success') {
        //         // 1. Capture the image URL for later processing
        //         if (prevResult.nodeType === 'uploadImageNode') {
        //           sourceImageUrl = prevResult.output.imageUrl;
        //           const imgResp = await fetch(sourceImageUrl);
        //           const buffer = Buffer.from(await imgResp.arrayBuffer());
        //           parts.push({ inlineData: { mimeType: "image/png", data: buffer.toString('base64') }});
        //         }
        //         // 2. Capture text inputs
        //         if (prevResult.nodeType === 'textNode') {
        //           parts.push({ text: prevResult.output.text });
        //         }
        //       }
        //     }

        //     // 3. Get text instructions from Gemini
        //     const model = genAI.getGenerativeModel({ model: node.data.model || 'gemini-1.5-flash' });
        //     const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
        //     const overlayText = result.response.text();

        //     // 4. GENERATE RESULTANT IMAGE (The fix you requested)
        //     if (sourceImageUrl) {
        //       const image = await loadImage(sourceImageUrl);
        //       const canvas = createCanvas(image.width, image.height);
        //       const ctx = canvas.getContext('2d');

        //       ctx.drawImage(image, 0, 0);
        //       ctx.font = 'bold 40px sans-serif';
        //       ctx.fillStyle = 'white';
        //       ctx.strokeStyle = 'black';
        //       ctx.lineWidth = 2;
        //       ctx.strokeText(overlayText, 50, 100);
        //       ctx.fillText(overlayText, 50, 100);

        //       // Update output to include the new image
        //       output = { 
        //         response: overlayText,
        //         resultantImageUrl: canvas.toDataURL() // This is your new base64 image
        //       };
        //     } else {
        //       output = { response: overlayText };
        //     }
        //     break;
        //   }

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
      data: { status: 'FAILED', error: error.message, nodeResults: JSON.stringify(nodeResults) },
    });
  }
}
