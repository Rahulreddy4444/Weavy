'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChevronRight, 
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface WorkflowRun {
  id: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
  scope: 'FULL' | 'PARTIAL' | 'SINGLE';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  nodeResults: any[];
}

interface Props {
  workflowId: string;
}

export default function RightSidebar({ workflowId }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  }, [workflowId]);

  const fetchRuns = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      const data = await response.json();
      setRuns(data.workflow.workflowRuns || []);
    } catch (error) {
      console.error('Failed to fetch runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Workflow History</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Run List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : runs.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No runs yet</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {runs.map((run) => (
              <Collapsible key={run.id}>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <CollapsibleTrigger className="w-full p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(run.status)}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            Run #{run.id.slice(-6)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(run.status)}`}>
                            {run.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {run.scope === 'FULL' ? 'Full Workflow' : 
                           run.scope === 'PARTIAL' ? 'Selected Nodes' : 
                           'Single Node'}
                        </p>
                        {run.duration && (
                          <p className="text-xs text-gray-400">
                            Duration: {(run.duration / 1000).toFixed(2)}s
                          </p>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <Separator />
                    <div className="p-3 space-y-2">
                      {run.nodeResults && run.nodeResults.length > 0 ? (
                        run.nodeResults.map((result: any, index: number) => (
                          <div 
                            key={index}
                            className="text-xs p-2 bg-gray-50 rounded border border-gray-100"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {result.status === 'success' ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span className="font-medium">{result.nodeId}</span>
                              <span className="text-gray-400">
                                {(result.duration / 1000).toFixed(2)}s
                              </span>
                            </div>
                            {result.error && (
                              <p className="text-red-600 text-xs mt-1">
                                Error: {result.error}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">No execution details</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}