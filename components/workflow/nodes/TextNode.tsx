'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Type } from 'lucide-react';
import BaseNode from './BaseNode';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Label } from '@/components/ui/label';

export default memo(function TextNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { text: e.target.value });
    },
    [id, updateNodeData]
  );

  const charCount = (data.text || '').length;

  return (
    <BaseNode
      title={data.label || 'Text Input'}
      label={data.label}
      icon={<Type className="w-4 h-4 text-emerald-400" />}
      outputs={[{ id: 'output', label: 'Text' }]}
      isRunning={data.isRunning}
      isSuccess={data.response || data.text}
      nodeType="input"
    >
      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-500 uppercase">
          Content
        </Label>
        <Textarea
          value={data.text || ''}
          onChange={handleChange}
          placeholder="Enter text content..."
          className="min-h-[100px] text-sm bg-[#0a0f1a] border-[#1e293b] text-gray-300 resize-none focus:border-emerald-500/50 placeholder:text-gray-600"
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{charCount} characters</span>
          {charCount > 0 && (
            <span>{data.text?.split('\n').length || 0} lines</span>
          )}
        </div>
      </div>
    </BaseNode>
  );
});