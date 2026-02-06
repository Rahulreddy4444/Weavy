'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import BaseNode from './BaseNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/stores/workflow-store';

const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
];

export default memo(function LLMNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleModelChange = (value: string) => updateNodeData(id, { model: value });
  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => 
    updateNodeData(id, { systemPrompt: e.target.value });
  const handleUserMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => 
    updateNodeData(id, { userMessage: e.target.value });

  return (
    <BaseNode
      title="Run LLM"
      icon={<Sparkles className="w-4 h-4" />}
      inputs={[
        { id: 'system_prompt', label: 'System Prompt' },
        { id: 'user_message', label: 'User Message' },
      ]}
      outputs={[{ id: 'output', label: 'Response' }]}
      isRunning={data.isRunning}
    >
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-700">Model</label>
          <Select value={data.model || 'gemini-1.5-flash'} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {GEMINI_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700">System Prompt</label>
          <Textarea
            value={data.systemPrompt || ''}
            onChange={handleSystemPromptChange}
            placeholder="You are a helpful assistant..."
            className="mt-1 text-sm min-h-[60px]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700">User Message</label>
          <Textarea
            value={data.userMessage || ''}
            onChange={handleUserMessageChange}
            placeholder="Enter message..."
            className="mt-1 text-sm min-h-[60px]"
          />
        </div>

        {data.response && (
          <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-xs font-medium text-green-900 mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Response:
            </p>
            <div className="text-sm text-green-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {data.response}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});