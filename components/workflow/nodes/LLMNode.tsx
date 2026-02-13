'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps } from 'reactflow';
import { Sparkles, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import BaseNode from './BaseNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Label } from '@/components/ui/label';

const AI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'Google', badge: 'Recommended' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'Google', badge: 'Advanced' },
  { value: 'gemini-pro', label: 'Google Gemini Pro', provider: 'Google', badge: 'Fast' },
  { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro', provider: 'Google', badge: 'Advanced' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', badge: 'Powerful' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI', badge: 'Fast' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI', badge: 'Fast' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: 'Best' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', provider: 'Anthropic', badge: 'Fast' },
];

export default memo(function LLMNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [numInputs, setNumInputs] = useState(data.numInputs || 1);

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

  const addInput = useCallback(() => {
    const newNum = numInputs + 1;
    setNumInputs(newNum);
    updateNodeData(id, { numInputs: newNum });
  }, [numInputs, id, updateNodeData]);

  const removeInput = useCallback(() => {
    if (numInputs > 1) {
      const newNum = numInputs - 1;
      setNumInputs(newNum);
      updateNodeData(id, { numInputs: newNum });
    }
  }, [numInputs, id, updateNodeData]);

  // Generate dynamic inputs
  const inputs = Array.from({ length: numInputs }, (_, i) => ({
    id: `user_message_${i}`,
    label: `Input ${i + 1}`,
  }));

  inputs.unshift({ id: 'system_prompt', label: 'System' });
  inputs.push({ id: 'images', label: 'Images' });

  return (
    <BaseNode
      title={data.label || 'AI Model'}
      label={data.label}
      icon={<Sparkles className="w-4 h-4 text-violet-400" />}
      inputs={inputs}
      outputs={[{ id: 'output', label: 'Response' }]}
      isRunning={data.isRunning}
      isSuccess={data.response}
      nodeType="ai"
    >
      <div className="space-y-4">
        {/* Model Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase">
            Model
          </Label>
          <Select value={data.model || 'gemini-2.5-flash'} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-violet-500/50">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] border-[#1e293b]">
              {AI_MODELS.map((model) => (
                <SelectItem
                  key={model.value}
                  value={model.value}
                  className="text-gray-300 focus:bg-[#1e293b] focus:text-white"
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    <span>{model.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{model.provider}</span>
                      <span className="text-xs text-violet-400">{model.badge}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Inputs Control */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <Label className="text-xs font-medium text-gray-400 uppercase">Input Connections</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/5"
              onClick={removeInput}
              disabled={numInputs <= 1}
            >
              <X className="w-3 h-3" />
            </Button>
            <span className="text-xs text-gray-500 font-mono w-4 text-center">{numInputs}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/5"
              onClick={addInput}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase flex items-center justify-between">
            <span>System Prompt</span>
            <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
              Connect to 'System'
            </span>
          </Label>
          <Textarea
            value={data.systemPrompt || ''}
            onChange={handleSystemPromptChange}
            placeholder="You are a helpful AI assistant..."
            className="text-sm min-h-[60px] bg-[#0a0f1a] border-[#1e293b] text-gray-300 resize-none focus:border-violet-500/50 placeholder:text-gray-600"
          />
        </div>

        {/* User Message */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase flex items-center justify-between">
            <span>User Message</span>
            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              Connect inputs
            </span>
          </Label>
          <Textarea
            value={data.userMessage || ''}
            onChange={handleUserMessageChange}
            placeholder="Enter your message..."
            className="text-sm min-h-[60px] bg-[#0a0f1a] border-[#1e293b] text-gray-300 resize-none focus:border-violet-500/50 placeholder:text-gray-600"
          />
        </div>

        {/* Response Display */}
        {data.response && (
          <div className="mt-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-400">
                Response ready {data.duration && `(${(data.duration / 1000).toFixed(1)}s)`}
              </span>
            </div>
            <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {data.response}
            </div>
          </div>
        )}

        {/* Error Display */}
        {data.error && (
          <div className="mt-3 p-3 rounded-lg border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-red-400">
                Error
              </span>
            </div>
            <div className="text-sm text-gray-300">
              {data.error}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});