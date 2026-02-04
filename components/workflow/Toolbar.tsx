'use client';

import { Play, Save, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

interface Props {
  workflowId: string;
  onRun: () => void;
  onSave: () => void;
}

export default function Toolbar({ workflowId, onRun, onSave }: Props) {
  const { nodes, edges, isRunning, selectedNodes } = useWorkflowStore();

  const handleExport = () => {
    const workflow = {
      nodes,
      edges,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${workflowId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Workflow exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const workflow = JSON.parse(text);
        
        useWorkflowStore.getState().setNodes(workflow.nodes);
        useWorkflowStore.getState().setEdges(workflow.edges);
        
        toast.success('Workflow imported');
      } catch (error) {
        toast.error('Failed to import workflow');
      }
    };

    input.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2">
      <Button
        size="sm"
        onClick={onRun}
        disabled={isRunning || nodes.length === 0}
      >
        <Play className="h-4 w-4 mr-2" />
        Run {selectedNodes.length > 0 && `(${selectedNodes.length})`}
      </Button>

      <div className="w-px h-6 bg-gray-200" />

      <Button
        size="sm"
        variant="outline"
        onClick={onSave}
        disabled={isRunning}
      >
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleExport}
        disabled={nodes.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleImport}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
    </div>
  );
}