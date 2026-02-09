'use client';

import { Play, Save, Download, Upload, Loader2 } from 'lucide-react';
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
    a.download = `workflow-${workflowId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Workflow exported successfully');
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
        
        if (!workflow.nodes || !workflow.edges) {
          throw new Error('Invalid workflow file');
        }

        useWorkflowStore.getState().setNodes(workflow.nodes);
        useWorkflowStore.getState().setEdges(workflow.edges);
        
        toast.success('Workflow imported successfully');
      } catch (error) {
        toast.error('Failed to import workflow');
      }
    };

    input.click();
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border px-4 py-2.5 flex items-center gap-3">
      {/* Run Button */}
      <Button
        size="sm"
        onClick={onRun}
        disabled={isRunning || nodes.length === 0}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run {selectedNodes.length > 0 && `(${selectedNodes.length})`}
          </>
        )}
      </Button>

      <div className="w-px h-6 bg-border" />

      {/* Save Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={onSave}
        disabled={isRunning}
        className="border-border hover:bg-secondary"
      >
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>

      {/* Export Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleExport}
        disabled={nodes.length === 0}
        className="border-border hover:bg-secondary"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      {/* Import Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleImport}
        className="border-border hover:bg-secondary"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>

      {/* Info */}
      {nodes.length > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <div className="text-xs text-muted-foreground">
            {nodes.length} nodes • {edges.length} connections
          </div>
        </>
      )}
    </div>
  );
}