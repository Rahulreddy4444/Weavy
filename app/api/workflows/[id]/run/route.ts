import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

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





// import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server';
// import { prisma } from '@/lib/prisma';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { userId: clerkUserId } = await auth();
//     if (!clerkUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     const { id } = await params;
//     const body = await request.json();
//     const { scope = 'FULL' } = body;

//     const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
//     if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

//     const workflow = await prisma.workflow.findFirst({
//       where: { id, userId: user.id },
//     });

//     if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });

//     const nodes = JSON.parse(workflow.nodes as string);
//     const edges = JSON.parse(workflow.edges as string);

//     const workflowRun = await prisma.workflowRun.create({
//       data: {
//         workflowId: workflow.id,
//         userId: user.id,
//         status: 'RUNNING',
//         scope,
//         nodeResults: JSON.stringify([]),
//       },
//     });

//     // Background execution
//     executeWorkflow(workflowRun.id, nodes, edges).catch(console.error);

//     return NextResponse.json({ runId: workflowRun.id, status: 'RUNNING' });
//   } catch (error) {
//     console.error('Workflow execution error:', error);
//     return NextResponse.json({ error: 'Execution failed' }, { status: 500 });
//   }
// }

// async function executeWorkflow(runId: string, nodes: any[], edges: any[]) {
//   const nodeResults: any[] = [];
//   const startTime = Date.now();

//   try {
//     for (const node of nodes) {
//       const nodeStartTime = Date.now();
//       try {
//         let output: any = {};

//         switch (node.type) {
//           case 'textNode':
//             output = { text: node.data.text || '' };
//             break;

//           case 'llmNode': {
//             // ✅ Get inputs from connected nodes
//             const incomingEdges = edges.filter(e => e.target === node.id);
//             let systemPrompt = node.data.systemPrompt || '';
//             let userMessage = node.data.userMessage || '';
            
//             // ✅ Map inputs from previous node results
//             for (const edge of incomingEdges) {
//               const prevResult = nodeResults.find(r => r.nodeId === edge.source);
//               if (prevResult && prevResult.status === 'success') {
//                 const incomingText = prevResult.output.text || prevResult.output.response || '';
                
//                 if (edge.targetHandle === 'system_prompt') {
//                   systemPrompt = incomingText;
//                 } else if (edge.targetHandle === 'user_message') {
//                   userMessage = incomingText;
//                 }
//               }
//             }

//             // Check API key
//             if (!process.env.GOOGLE_GEMINI_API_KEY) {
//               output = { response: 'Error: GOOGLE_GEMINI_API_KEY not set in .env.local' };
//               break;
//             }

//             // ✅ Use gemini-pro (most stable)
//             const modelId = node.data.model || 'gemini-2.5-flash';
            
//             const model = genAI.getGenerativeModel({ 
//               model: modelId 
//             });

//             // Build prompt
//             const parts: string[] = [];
//             if (systemPrompt) {
//               parts.push(`System: ${systemPrompt}\n\n`);
//             }
//             if (userMessage) {
//               parts.push(userMessage);
//             } else {
//               parts.push('Hello');
//             }

//             const result = await model.generateContent(parts.join(''));
//             const response = await result.response;
//             output = { response: response.text() };
//             break;
//           }

//           case 'uploadImageNode':
//             output = { imageUrl: node.data.imageUrl || '' };
//             break;

//           case 'uploadVideoNode':
//             output = { videoUrl: node.data.videoUrl || '' };
//             break;

//           case 'cropImageNode':
//             output = { croppedUrl: 'https://placehold.co/400x400/png?text=Cropped' };
//             break;

//           case 'extractFrameNode':
//             output = { extractedFrameUrl: 'https://placehold.co/400x400/png?text=Frame' };
//             break;

//           default:
//             output = node.data || {};
//         }

//         nodeResults.push({
//           nodeId: node.id,
//           nodeType: node.type,
//           status: 'success',
//           output,
//           duration: Date.now() - nodeStartTime,
//           timestamp: new Date().toISOString(),
//         });

//       } catch (error: any) {
//         nodeResults.push({
//           nodeId: node.id,
//           nodeType: node.type,
//           status: 'failed',
//           error: error.message,
//           duration: Date.now() - nodeStartTime,
//           timestamp: new Date().toISOString(),
//         });
//       }
//     }

//     await prisma.workflowRun.update({
//       where: { id: runId },
//       data: {
//         status: 'SUCCESS',
//         completedAt: new Date(),
//         duration: Date.now() - startTime,
//         nodeResults: JSON.stringify(nodeResults),
//       },
//     });
//   } catch (error: any) {
//     await prisma.workflowRun.update({
//       where: { id: runId },
//       data: { 
//         status: 'FAILED', 
//         completedAt: new Date(),
//         duration: Date.now() - startTime,
//         error: error.message, 
//         nodeResults: JSON.stringify(nodeResults) 
//       },
//     });
//   }
// }