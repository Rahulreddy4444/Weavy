'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Crop } from 'lucide-react';
import BaseNode from './BaseNode';
import { Input } from '@/components/ui/input';
import { useWorkflowStore } from '@/stores/workflow-store';

export default memo(function CropImageNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      updateNodeData(id, { [field]: Math.max(0, Math.min(100, value)) });
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      title="Crop Image"
      icon={<Crop className="w-4 h-4" />}
      inputs={[{ id: 'image_url', label: 'Image' }]}
      outputs={[{ id: 'output', label: 'Cropped Image' }]}
      isRunning={data.isRunning}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-700">X %</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={data.xPercent || 0}
              onChange={handleChange('xPercent')}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Y %</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={data.yPercent || 0}
              onChange={handleChange('yPercent')}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-700">Width %</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={data.widthPercent || 100}
              onChange={handleChange('widthPercent')}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Height %</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={data.heightPercent || 100}
              onChange={handleChange('heightPercent')}
              className="mt-1"
            />
          </div>
        </div>

        {data.croppedUrl && (
          <div className="mt-2 rounded border">
            <img
              src={data.croppedUrl}
              alt="Cropped"
              className="w-full h-32 object-cover rounded"
            />
          </div>
        )}
      </div>
    </BaseNode>
  );
});