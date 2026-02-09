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
      title="Crop Image"
      icon={<Crop className="w-4 h-4" />}
      inputs={[{ id: 'image_url', label: 'Image' }]}
      outputs={[{ id: 'output', label: 'Cropped' }]}
      isRunning={data.isRunning}
      headerColor="from-pink-500/20 to-rose-500/20"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              X Position %
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.xPercent || 0}
              onChange={handleChange('xPercent')}
              className="bg-background/50 border-border"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Y Position %
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.yPercent || 0}
              onChange={handleChange('yPercent')}
              className="bg-background/50 border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Width %
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.widthPercent || 100}
              onChange={handleChange('widthPercent')}
              className="bg-background/50 border-border"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Height %
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={data.heightPercent || 100}
              onChange={handleChange('heightPercent')}
              className="bg-background/50 border-border"
            />
          </div>
        </div>

        {data.croppedUrl && (
          <div className="mt-3 node-image-preview rounded-lg overflow-hidden border border-border">
            <img
              src={data.croppedUrl}
              alt="Cropped"
              className="w-full h-40 object-cover"
            />
            <div className="px-2 py-1.5 bg-secondary/30 text-xs text-muted-foreground">
              Cropped Result
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});