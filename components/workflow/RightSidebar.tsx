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
  ChevronDown,
  ChevronUp,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Props {
  workflowId: string;
}

function normalizeNodeResults(nodeResults: any): any[] {
  if (!nodeResults) return [];
  if (Array.isArray(nodeResults)) return nodeResults;
  if (typeof nodeResults === 'object') return Object.values(nodeResults);
  if (typeof nodeResults === 'string') {
    try {
      const parsed = JSON.parse(nodeResults);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object') return Object.values(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

export default function RightSidebar({ workflowId }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  }, [workflowId]);

  const fetchRuns = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) return;
      const data = await response.json();
      setRuns(data.workflow?.workflowRuns || []);
    } catch (error) {
      console.error('Failed to fetch runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRunExpanded = (runId: string) => {
    setExpandedRuns((prev) => {
      const next = new Set(prev);
      next.has(runId) ? next.delete(runId) : next.add(runId);
      return next;
    });
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
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'SUCCESS':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'FAILED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (collapsed) {
    return (
      <div className="w-14 bg-[hsl(var(--sidebar-bg))] border-l border-border flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <History className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-80 bg-[hsl(var(--sidebar-bg))] border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Workflow History</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Runs List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : runs.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">No runs yet</p>
            <p className="text-xs text-muted-foreground">
              Click "Run" to execute your workflow
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {runs.map((run: any) => {
              const nodeResults = normalizeNodeResults(run.nodeResults);
              const isExpanded = expandedRuns.has(run.id);

              return (
                <div
                  key={run.id}
                  className="bg-card/50 rounded-lg border border-border p-3 hover:bg-card/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(run.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          Run #{run.id.slice(-6)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
                            run.status
                          )}`}
                        >
                          {run.status}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(run.startedAt), {
                          addSuffix: true,
                        })}
                      </p>

                      {run.duration && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Duration: {(run.duration / 1000).toFixed(2)}s
                        </p>
                      )}

                      {/* Node Results */}
                      {nodeResults.length > 0 && (
                        <Collapsible
                          open={isExpanded}
                          onOpenChange={() => toggleRunExpanded(run.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between mt-2 h-7 text-xs hover:bg-secondary/50"
                            >
                              <span className="text-muted-foreground">
                                {nodeResults.length} node(s) executed
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </Button>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="mt-2 space-y-2">
                            {nodeResults.map((result: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-background/50 rounded-md p-2.5 text-xs border border-border"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-medium text-foreground">
                                    {result.nodeType?.replace('Node', '') || 'Node'}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-xs ${
                                      result.status?.toLowerCase() === 'success'
                                        ? 'bg-green-500/10 text-green-500'
                                        : 'bg-red-500/10 text-red-500'
                                    }`}
                                  >
                                    {result.status}
                                  </span>
                                </div>

                                {result.output && (
                                  <div className="space-y-1">
                                    {result.output.text && (
                                      <p className="text-muted-foreground line-clamp-2">
                                        <span className="text-primary">Text:</span> {result.output.text}
                                      </p>
                                    )}
                                    {result.output.response && (
                                      <p className="text-muted-foreground line-clamp-3">
                                        <span className="text-purple-500">AI:</span> {result.output.response}
                                      </p>
                                    )}
                                    {result.output.imageUrl && (
                                      <p className="text-muted-foreground truncate">
                                        <span className="text-green-500">Image:</span> {result.output.imageUrl.slice(0, 40)}...
                                      </p>
                                    )}
                                  </div>
                                )}

                                {result.error && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Error: {result.error}
                                  </p>
                                )}
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}