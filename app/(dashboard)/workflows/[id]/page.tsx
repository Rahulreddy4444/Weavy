'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { toast } from 'sonner';
import Canvas from '@/components/workflow/Canvas';
import Sidebar from '@/components/workflow/Sidebar';
import RightSidebar from '@/components/workflow/RightSidebar';
import Toolbar from '@/components/workflow/Toolbar';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workflowId } = use(params);
  const router = useRouter();
  
  const { nodes, edges, setNodes, setEdges, selectedNodes, setIsRunning } = useWorkflowStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workflow, setWorkflow] = useState<any>(null);

  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!saving && nodes.length > 0) {
        handleSave(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [nodes, edges, saving]);

  const loadWorkflow = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load workflow');
      }

      const data = await response.json();
      const wf = data.workflow;
      
      setWorkflow(wf);
      setNodes(wf.nodes || []);
      setEdges(wf.edges || []);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load workflow');
      router.push('/workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (silent = false) => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
        }),
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      if (!silent) {
        toast.success('Workflow saved');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (nodes.length === 0) {
      toast.error('Add some nodes first');
      return;
    }

    setIsRunning(true);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedNodes: selectedNodes.length > 0 ? selectedNodes : undefined,
          scope: selectedNodes.length === 0 ? 'FULL' : 
                 selectedNodes.length === 1 ? 'SINGLE' : 'PARTIAL',
        }),
      });

      if (!response.ok) {
        throw new Error('Execution failed');
      }

      const data = await response.json();
      toast.success(`Workflow started (Run #${data.runId.slice(-6)})`);

      pollRunStatus(data.runId);
    } catch (error) {
      console.error('Run error:', error);
      toast.error('Failed to start workflow');
      setIsRunning(false);
    }
  };

  const pollRunStatus = async (runId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`/api/runs/${runId}`);
        const data = await response.json();
        const run = data.run;

        if (run.status === 'SUCCESS') {
          clearInterval(poll);
          setIsRunning(false);
          toast.success('Workflow completed successfully!');

          const nodeResults = (() => {
            if (!run.nodeResults) return [];
            if (Array.isArray(run.nodeResults)) return run.nodeResults;
            if (typeof run.nodeResults === 'object') return Object.values(run.nodeResults);
            if (typeof run.nodeResults === 'string') {
              try {
                const parsed = JSON.parse(run.nodeResults);
                if (Array.isArray(parsed)) return parsed;
                if (typeof parsed === 'object') return Object.values(parsed);
              } catch { return []; }
            }
            return [];
          })();

          nodeResults.forEach((result: any) => {
            if (!result?.nodeId) return;
            useWorkflowStore.getState().updateNodeData(result.nodeId, {
              ...(result.output || {}),
              isRunning: false,
            });
          });
        } 
        else if (run.status === 'FAILED') {
          clearInterval(poll);
          setIsRunning(false);
          toast.error(`Workflow failed: ${run.error || 'Unknown error'}`);
        } 
        else if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsRunning(false);
          toast.error('Workflow execution timed out');
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 5000);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050b18]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#050b18]">
      {/* Header Updated for Dark Mode Visibility */}
      <header className="h-14 border-b border-white/10 bg-[#050b18] px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => router.push('/workflows')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg text-white leading-tight">
              {workflow?.name || 'Workflow'}
            </h1>
            {workflow?.description && (
              <p className="text-xs text-gray-400">{workflow.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {saving && (
            <span className="text-sm text-gray-400 animate-pulse">Saving...</span>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 relative bg-[#050b18]">
          <ReactFlowProvider>
            <Canvas />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
              <Toolbar
                workflowId={workflowId}
                onRun={handleRun}
                onSave={() => handleSave(false)}
              />
            </div>
          </ReactFlowProvider>
        </main>

        <RightSidebar workflowId={workflowId} />
      </div>
    </div>
  );
}