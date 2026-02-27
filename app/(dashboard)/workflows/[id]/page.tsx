'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { toast } from 'sonner';
import Canvas from '@/components/workflow/Canvas';
import Sidebar from '@/components/workflow/Sidebar';
import PropertiesPanel from '@/components/workflow/PropertiesPanel';
import TopNavigation from '@/components/workflow/TopNavigation';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Loader2 } from 'lucide-react';

export default function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workflowId } = use(params);
  const router = useRouter();

  const { nodes, edges, setNodes, setEdges, selectedNodes, setIsRunning } = useWorkflowStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workflow, setWorkflow] = useState<any>(null);
  const [lastSaved, setLastSaved] = useState<string>('');

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

      if (wf.updatedAt) {
        const date = new Date(wf.updatedAt);
        setLastSaved(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
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

      const now = new Date();
      setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

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

        if (!response.ok) {
          const text = await response.text();
          console.error(`Runs API error (${response.status}):`, text);
          throw new Error('API returned non-OK status');
        }

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
              duration: result.duration,
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
      <div className="h-screen flex items-center justify-center bg-[#0a0f1a]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-[#0a0f1a]">
        {/* Top Navigation */}
        <TopNavigation
          workflowId={workflowId}
          workflowName={workflow?.name || 'Untitled Workflow'}
          workflowDescription={workflow?.description}
          lastSaved={lastSaved}
          onRun={handleRun}
          onSave={() => handleSave(false)}
          isRunning={useWorkflowStore.getState().isRunning}
          isSaving={saving}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Nodes */}
          <Sidebar />

          {/* Canvas */}
          <main className="flex-1 relative bg-[#0a0f1a]">
            <Canvas />
          </main>

          {/* Right Sidebar - Properties */}
          <PropertiesPanel workflowId={workflowId} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}