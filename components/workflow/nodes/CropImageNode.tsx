'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Crop } from 'lucide-react';
import BaseNode from './BaseNode';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      title={data.label || 'Crop Image'}
      label={data.label}
      icon={<Crop className="w-4 h-4 text-pink-400" />}
      inputs={[{ id: 'image_url', label: 'Image' }]}
      outputs={[{ id: 'output', label: 'Cropped' }]}
      isRunning={data.isRunning}
      isSuccess={data.imageUrl}
      nodeType="transform"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">
              X %
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.xPercent || 0}
              onChange={handleChange('xPercent')}
              className="bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-pink-500/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">
              Y %
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.yPercent || 0}
              onChange={handleChange('yPercent')}
              className="bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-pink-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">
              Width %
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.widthPercent || 100}
              onChange={handleChange('widthPercent')}
              className="bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-pink-500/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">
              Height %
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.heightPercent || 100}
              onChange={handleChange('heightPercent')}
              className="bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-pink-500/50"
            />
          </div>
        </div>

        {data.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-[#1e293b]">
            <img
              src={data.imageUrl}
              alt="Cropped"
              className="w-full h-32 object-cover"
            />
            <div className="px-2 py-1.5 bg-[#0a0f1a] text-xs text-gray-500">
              Cropped Result
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});