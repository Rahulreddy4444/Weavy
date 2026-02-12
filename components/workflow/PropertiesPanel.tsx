'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Settings,
  Eye,
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

interface Props {
  workflowId: string;
}

type TabType = 'config' | 'output' | 'history';

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

export default function PropertiesPanel({ workflowId }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());

  const { nodes, selectedNodes, updateNodeData, deleteNode } = useWorkflowStore();

  const selectedNode = selectedNodes.length === 1
    ? nodes.find(n => n.id === selectedNodes[0])
    : null;

  useEffect(() => {
    if (activeTab === 'history') {
      fetchRuns();
    }
  }, [activeTab, workflowId]);

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

  const handleDuplicateNode = () => {
    if (!selectedNode) return;

    const newNode = {
      ...selectedNode,
      id: `${selectedNode.type}-${Date.now()}`,
      position: {
        x: selectedNode.position.x + 50,
        y: selectedNode.position.y + 50,
      },
      data: { ...selectedNode.data, label: `${selectedNode.data.label || 'Node'} (copy)` },
    };

    useWorkflowStore.getState().addNode(newNode);
    toast.success('Node duplicated');
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    deleteNode(selectedNode.id);
    toast.success('Node deleted');
  };

  const handleLabelChange = (value: string) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, { label: value });
  };

  const handleTemperatureChange = (value: number) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, { temperature: value });
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
        return <Clock className="h-4 w-4 text-gray-500" />;
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
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'textNode':
      case 'uploadImageNode':
      case 'uploadVideoNode':
        return <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center" />;
      case 'llmNode':
        return <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>;
      case 'cropImageNode':
      case 'extractFrameNode':
        return <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center" />;
      case 'conditionNode':
      case 'loopNode':
      case 'mergeNode':
        return <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center" />;
      case 'outputNode':
        return <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center" />;
      default:
        return <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center" />;
    }
  };

  const renderConfigTab = () => {
    if (!selectedNode) {
      return (
        <div className="p-8 text-center">
          <Settings className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Select a node to configure</p>
        </div>
      );
    }

    const isLLMNode = selectedNode.type === 'llmNode';

    return (
      <div className="p-4 space-y-6">
        {/* Node Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#1e293b]">
          {getNodeIcon(selectedNode.type || '')}
          <div>
            <h3 className="font-semibold text-white">
              {selectedNode.data.label || (selectedNode.type || '').replace('Node', '')}
            </h3>
            <p className="text-xs text-gray-500">ID: {selectedNode.id.slice(-6)}</p>
          </div>
        </div>

        {/* Label Field */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-400 uppercase">Label</Label>
          <Input
            value={selectedNode.data.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Enter node label..."
            className="bg-[#1e293b]/50 border-[#1e293b] text-gray-300 focus:border-indigo-500/50"
          />
        </div>

        {/* AI Model Field (for LLM nodes) */}
        {isLLMNode && (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-400 uppercase">AI Model</Label>
              <div className="p-3 rounded-lg bg-[#1e293b]/50 border border-[#1e293b]">
                <span className="text-sm text-indigo-400 font-medium">
                  {selectedNode.data.model || 'gemini-2.5-flash'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-400 uppercase">System Prompt</Label>
              <Textarea
                value={selectedNode.data.systemPrompt || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { systemPrompt: e.target.value })}
                placeholder="You are a helpful AI assistant..."
                className="min-h-[100px] bg-[#1e293b]/50 border-[#1e293b] text-gray-300 focus:border-indigo-500/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-400 uppercase">Temperature</Label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedNode.data.temperature || 0.7}
                  onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Precise</span>
                  <span className="text-indigo-400">{(selectedNode.data.temperature || 0.7).toFixed(1)}</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content Field (for Text nodes) */}
        {selectedNode.type === 'textNode' && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-400 uppercase">Content</Label>
            <Textarea
              value={selectedNode.data.text || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { text: e.target.value })}
              placeholder="Enter text content..."
              className="min-h-[150px] bg-[#1e293b]/50 border-[#1e293b] text-gray-300 focus:border-indigo-500/50 resize-none"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-[#1e293b]">
          <Button
            variant="outline"
            className="flex-1 border-[#1e293b] bg-[#1e293b]/50 text-gray-300 hover:bg-[#1e293b] hover:text-white"
            onClick={handleDuplicateNode}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            onClick={handleDeleteNode}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    );
  };

  const renderOutputTab = () => {
    if (!selectedNode) {
      return (
        <div className="p-8 text-center">
          <Eye className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Select a node to view output</p>
        </div>
      );
    }

    const hasOutput = selectedNode.data.response || selectedNode.data.text || selectedNode.data.imageUrl || selectedNode.data.videoUrl;

    if (!hasOutput) {
      return (
        <div className="p-8 text-center">
          <Eye className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No output yet. Run the workflow to see results.</p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        {selectedNode.data.response && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-400 uppercase">AI Response</Label>
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">
                {selectedNode.data.response}
              </p>
            </div>
          </div>
        )}

        {selectedNode.data.text && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-400 uppercase">Text Content</Label>
            <div className="p-3 rounded-lg bg-[#1e293b]/50 border border-[#1e293b]">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">
                {selectedNode.data.text}
              </p>
            </div>
          </div>
        )}

        {selectedNode.data.imageUrl && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-400 uppercase">Image</Label>
            <div className="rounded-lg overflow-hidden border border-[#1e293b]">
              <img
                src={selectedNode.data.imageUrl}
                alt="Uploaded"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {selectedNode.data.videoUrl && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-400 uppercase">Video</Label>
            <video
              src={selectedNode.data.videoUrl}
              controls
              className="w-full rounded-lg border border-[#1e293b]"
            />
          </div>
        )}
      </div>
    );
  };

  const renderHistoryTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      );
    }

    if (runs.length === 0) {
      return (
        <div className="p-8 text-center">
          <History className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No runs yet</p>
          <p className="text-xs text-gray-600 mt-1">Click Run to execute your workflow</p>
        </div>
      );
    }

    return (
      <div className="p-3 space-y-2">
        {runs.map((run: any) => {
          const nodeResults = normalizeNodeResults(run.nodeResults);
          const isExpanded = expandedRuns.has(run.id);

          return (
            <div
              key={run.id}
              className="bg-[#1e293b]/30 rounded-lg border border-[#1e293b] p-3 hover:bg-[#1e293b]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(run.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-300">
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

                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(run.startedAt), {
                      addSuffix: true,
                    })}
                  </p>

                  {run.duration && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Duration: {(run.duration / 1000).toFixed(2)}s
                    </p>
                  )}

                  {nodeResults.length > 0 && (
                    <Collapsible
                      open={isExpanded}
                      onOpenChange={() => toggleRunExpanded(run.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between mt-2 h-7 text-xs hover:bg-[#1e293b]"
                        >
                          <span className="text-gray-500">
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
                            className="bg-[#0a0f1a] rounded-md p-2.5 text-xs border border-[#1e293b]"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-medium text-gray-300">
                                {result.nodeType?.replace('Node', '') || 'Node'}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs ${result.status?.toLowerCase() === 'success'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-red-500/10 text-red-500'
                                  }`}
                              >
                                {result.status}
                              </span>
                            </div>

                            {result.output?.response && (
                              <p className="text-gray-500 line-clamp-2">
                                {result.output.response.slice(0, 100)}...
                              </p>
                            )}

                            {result.error && (
                              <p className="text-red-400 text-xs mt-1">
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
    );
  };

  return (
    <div className="w-80 bg-[#0f1623] border-l border-[#1e293b] flex flex-col">
      {/* Tabs Header */}
      <div className="flex border-b border-[#1e293b]">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === 'config'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-300'
            }`}
        >
          <Settings className="w-4 h-4" />
          Config
        </button>
        <button
          onClick={() => setActiveTab('output')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === 'output'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-300'
            }`}
        >
          <Eye className="w-4 h-4" />
          Output
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === 'history'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-300'
            }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {/* Tab Content */}
      <ScrollArea className="flex-1">
        {activeTab === 'config' && renderConfigTab()}
        {activeTab === 'output' && renderOutputTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </ScrollArea>
    </div>
  );
}