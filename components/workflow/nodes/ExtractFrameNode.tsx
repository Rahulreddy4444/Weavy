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
      title="Extract Frame"
      icon={<Film className="w-4 h-4" />}
      inputs={[{ id: 'video_url', label: 'Video' }]}
      outputs={[{ id: 'output', label: 'Frame' }]}
      isRunning={data.isRunning}
      headerColor="from-cyan-500/20 to-blue-500/20"
    >
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Timestamp
          </Label>
          <Input
            type="text"
            value={data.timestamp || '0'}
            onChange={handleTimestampChange}
            placeholder="50% or 5.5s"
            className="bg-background/50 border-border"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Use percentage (e.g., "50%") or seconds (e.g., "5.5")
          </p>
        </div>

        {data.extractedFrameUrl && (
          <div className="mt-3 node-image-preview rounded-lg overflow-hidden border border-border">
            <img
              src={data.extractedFrameUrl}
              alt="Extracted frame"
              className="w-full h-40 object-cover"
            />
            <div className="px-2 py-1.5 bg-secondary/30 text-xs text-muted-foreground">
              Extracted Frame @ {data.timestamp}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});