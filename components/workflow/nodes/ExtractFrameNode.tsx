'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Film } from 'lucide-react';
import BaseNode from './BaseNode';
import { Input } from '@/components/ui/input';
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
      title="Extract Frame from Video"
      icon={<Film className="w-4 h-4" />}
      inputs={[{ id: 'video_url', label: 'Video' }]}
      outputs={[{ id: 'output', label: 'Frame Image' }]}
      isRunning={data.isRunning}
    >
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-700">
            Timestamp
          </label>
          <Input
            type="text"
            value={data.timestamp || '0'}
            onChange={handleTimestampChange}
            placeholder="50% or 5 (seconds)"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use "50%" for percentage or "5" for seconds
          </p>
        </div>

        {data.extractedFrameUrl && (
          <div className="mt-2 rounded border">
            <img
              src={data.extractedFrameUrl}
              alt="Extracted frame"
              className="w-full h-32 object-cover rounded"
            />
          </div>
        )}
      </div>
    </BaseNode>
  );
});