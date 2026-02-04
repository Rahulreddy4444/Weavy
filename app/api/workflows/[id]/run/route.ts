import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { WorkflowEngine } from '@/lib/workflow-engine';
import { tasks } from '@trigger.dev/sdk/v3';
// In app/api/workflows/[id]/run/route.ts
import { runLLM } from '@/trigger/llm-task';
import { cropImage } from '@/trigger/crop-image-task';
import { extractFrame } from '@/trigger/extract-frame-task';

// Later in the executeWorkflow function:

// POST /api/workflows/[id]/run - Execute workflow
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { selectedNodes, scope = 'FULL' } = body;

    // Fetch workflow
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const nodes = workflow.nodes as any[];
    const edges = workflow.edges as any[];

    // Determine which nodes to execute
    let nodesToExecute = nodes;
    if (scope === 'PARTIAL' && selectedNodes) {
      nodesToExecute = nodes.filter(n => selectedNodes.includes(n.id));
    } else if (scope === 'SINGLE' && selectedNodes && selectedNodes.length > 0) {
      nodesToExecute = nodes.filter(n => n.id === selectedNodes[0]);
    }

    // Create workflow run
    const workflowRun = await prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        userId,
        status: 'RUNNING',
        scope,
      },
    });

    // Execute workflow in background
    executeWorkflow(workflowRun.id, nodesToExecute, edges);

    return NextResponse.json({
      runId: workflowRun.id,
      status: 'RUNNING',
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      { error: 'Execution failed' },
      { status: 500 }
    );
  }
}

async function executeWorkflow(runId: string, nodes: any[], edges: any[]) {
  const startTime = Date.now();
  
  try {
    const engine = new WorkflowEngine(nodes, edges);

    // Validate DAG
    const validation = engine.validateDAG();
    if (!validation.valid) {
      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: 'FAILED',
          error: validation.error,
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      });
      return;
    }

    // Get parallel batches
    const batches = engine.getParallelBatches();
    const nodeResults: any[] = [];

    // Execute batches sequentially, nodes in each batch in parallel
    for (const batch of batches) {
      const promises = batch.map(async (nodeId) => {
        const node = engine.getNode(nodeId);
        if (!node) return null;

        const nodeStartTime = Date.now();
        
        try {
          // Get inputs from connected nodes
          const inputs = engine.getNodeInputs(nodeId);

          let result;
          
          // Execute based on node type
          switch (node.type) {
            case 'textNode':
              result = { output: node.data.text };
              break;

            case 'uploadImageNode':
              result = { output: node.data.imageUrl };
              break;

            case 'uploadVideoNode':
              result = { output: node.data.videoUrl };
              break;

            // case 'llmNode':
            //   // Trigger LLM task
            //   result = await tasks.trigger('run-llm', {
            //     model: node.data.model || 'gemini-pro',
            //     systemPrompt: inputs.system_prompt?.output || node.data.systemPrompt,
            //     userMessage: inputs.user_message?.output || node.data.userMessage,
            //     images: inputs.images ? [inputs.images.output] : undefined,
            //   });
            //   break;

            // case 'cropImageNode':
            //   result = await tasks.trigger('crop-image', {
            //     imageUrl: inputs.image_url?.output || node.data.imageUrl,
            //     xPercent: node.data.xPercent || 0,
            //     yPercent: node.data.yPercent || 0,
            //     widthPercent: node.data.widthPercent || 100,
            //     heightPercent: node.data.heightPercent || 100,
            //   });
            //   break;

            // case 'extractFrameNode':
            //   result = await tasks.trigger('extract-frame', {
            //     videoUrl: inputs.video_url?.output || node.data.videoUrl,
            //     timestamp: node.data.timestamp || '0',
            //   });
            //   break;

            case 'llmNode':
              result = await runLLM.trigger({  // ✅ NEW WAY
                model: node.data.model || 'gemini-pro',
                systemPrompt: inputs.system_prompt?.output || node.data.systemPrompt,
                userMessage: inputs.user_message?.output || node.data.userMessage,
                images: inputs.images ? [inputs.images.output] : undefined,
              });
              break;

            case 'cropImageNode':
              result = await cropImage.trigger({  // ✅ NEW WAY
                imageUrl: inputs.image_url?.output || node.data.imageUrl,
                xPercent: node.data.xPercent || 0,
                yPercent: node.data.yPercent || 0,
                widthPercent: node.data.widthPercent || 100,
                heightPercent: node.data.heightPercent || 100,
              });
              break;

            case 'extractFrameNode':
              result = await extractFrame.trigger({  // ✅ NEW WAY
                videoUrl: inputs.video_url?.output || node.data.videoUrl,
                timestamp: node.data.timestamp || '0',
              });
              break;

            default:
              result = { output: null };
          }

          engine.setNodeResult(nodeId, result);

          nodeResults.push({
            nodeId,
            status: 'success',
            output: result,
            duration: Date.now() - nodeStartTime,
            timestamp: new Date(),
          });

          return result;
        } catch (error: any) {
          nodeResults.push({
            nodeId,
            status: 'failed',
            error: error.message,
            duration: Date.now() - nodeStartTime,
            timestamp: new Date(),
          });

          throw error;
        }
      });

      await Promise.all(promises);
    }

    // Update workflow run as successful
    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'SUCCESS',
        nodeResults,
        completedAt: new Date(),
        duration: Date.now() - startTime,
      },
    });
  } catch (error: any) {
    // Update as failed
    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'FAILED',
        error: error.message,
        completedAt: new Date(),
        duration: Date.now() - startTime,
      },
    });
  }
}