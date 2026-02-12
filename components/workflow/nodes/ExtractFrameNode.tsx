'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Film } from 'lucide-react';
import BaseNode from './BaseNode';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkflowStore } from '@/stores/workflow-store';

export default memo(function ExtractFrameNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleTimestampChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { timestamp: e.target.value });
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      title={data.label || 'Extract Frame'}
      label={data.label}
      icon={<Film className="w-4 h-4 text-pink-400" />}
      inputs={[{ id: 'video_url', label: 'Video' }]}
      outputs={[{ id: 'output', label: 'Frame' }]}
      isRunning={data.isRunning}
      isSuccess={data.extractedFrameUrl}
      nodeType="transform"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-500 uppercase">
            Timestamp
          </Label>
          <Input
            type="text"
            value={data.timestamp || '0'}
            onChange={handleTimestampChange}
            placeholder="50% or 5.5s"
            className="bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-pink-500/50"
          />
          <p className="text-xs text-gray-500">
            Use percentage (e.g., &quot;50%&quot;) or seconds (e.g., &quot;5.5&quot;)
          </p>
        </div>

        {data.extractedFrameUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-[#1e293b]">
            <img
              src={data.extractedFrameUrl}
              alt="Extracted frame"
              className="w-full h-32 object-cover"
            />
            <div className="px-2 py-1.5 bg-[#0a0f1a] text-xs text-gray-500">
              Frame @ {data.timestamp}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});