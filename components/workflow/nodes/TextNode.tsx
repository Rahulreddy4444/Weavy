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
      title="Text Input"
      icon={<Type className="w-4 h-4" />}
      outputs={[{ id: 'output', label: 'Text' }]}
      isRunning={data.isRunning}
      headerColor="from-blue-500/20 to-cyan-500/20"
    >
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          Content
        </Label>
        <Textarea
          value={data.text || ''}
          onChange={handleChange}
          placeholder="Enter text..."
          className="min-h-[120px] text-sm bg-background/50 border-border resize-none font-mono"
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{charCount} characters</span>
          {charCount > 0 && (
            <span>{data.text?.split('\n').length || 0} lines</span>
          )}
        </div>
      </div>
    </BaseNode>
  );
});