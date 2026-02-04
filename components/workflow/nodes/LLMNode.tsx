'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Sparkles } from 'lucide-react';
import BaseNode from './BaseNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/stores/workflow-store';

const GEMINI_MODELS = [
  { value: 'gemini-pro', label: 'Gemini Pro' },
  { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
];

export default memo(function LLMNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleModelChange = useCallback(
    (value: string) => {
      updateNodeData(id, { model: value });
    },
    [id, updateNodeData]
  );

  const handleSystemPromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { systemPrompt: e.target.value });
    },
    [id, updateNodeData]
  );

  const handleUserMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { userMessage: e.target.value });
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      title="Run LLM"
      icon={<Sparkles className="w-4 h-4" />}
      inputs={[
        { id: 'system_prompt', label: 'System Prompt' },
        { id: 'user_message', label: 'User Message' },
        { id: 'images', label: 'Images' },
      ]}
      outputs={[{ id: 'output', label: 'Response' }]}
      isRunning={data.isRunning}
    >
      <div className="space-y-3">
        {/* Model Selector */}
        <div>
          <label className="text-xs font-medium text-gray-700">Model</label>
          <Select value={data.model || 'gemini-pro'} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {GEMINI_MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* System Prompt */}
        <div>
          <label className="text-xs font-medium text-gray-700">
            System Prompt <span className="text-gray-400">(Optional)</span>
          </label>
          <Textarea
            value={data.systemPrompt || ''}
            onChange={handleSystemPromptChange}
            placeholder="You are a helpful assistant..."
            className="mt-1 text-sm min-h-[60px]"
          />
        </div>

        {/* User Message */}
        <div>
          <label className="text-xs font-medium text-gray-700">
            User Message <span className="text-gray-400">(Optional if connected)</span>
          </label>
          <Textarea
            value={data.userMessage || ''}
            onChange={handleUserMessageChange}
            placeholder="Enter your message..."
            className="mt-1 text-sm min-h-[60px]"
          />
        </div>

        {/* Response Display */}
        {data.response && (
          <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">Response:</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.response}</p>
          </div>
        )}
      </div>
    </BaseNode>
  );
});