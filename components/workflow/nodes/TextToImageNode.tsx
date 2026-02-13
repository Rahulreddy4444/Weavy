'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps } from 'reactflow';
import { ImageIcon, Loader2 } from 'lucide-react';
import BaseNode from './BaseNode';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Label } from '@/components/ui/label';

export default memo(function TextToImageNode({ id, data }: NodeProps) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

    const handlePromptChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            updateNodeData(id, { prompt: e.target.value });
        },
        [id, updateNodeData]
    );

    return (
        <BaseNode
            title={data.label || 'Text to Image'}
            label={data.label}
            icon={<ImageIcon className="w-4 h-4 text-pink-400" />}
            inputs={[{ id: 'prompt', label: 'Prompt' }]}
            outputs={[{ id: 'image', label: 'Image' }]}
            isRunning={data.isRunning}
            isSuccess={!!data.imageUrl}
            nodeType="transform"
        >
            <div className="space-y-4">
                {/* Prompt Input */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500 uppercase flex items-center justify-between">
                        <span>Prompt</span>
                        <span className="text-[10px] text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                            Connect to 'Prompt'
                        </span>
                    </Label>
                    <Textarea
                        value={data.prompt || ''}
                        onChange={handlePromptChange}
                        placeholder="Describe the image you want to generate..."
                        className="text-sm min-h-[80px] bg-[#0a0f1a] border-[#1e293b] text-gray-300 resize-none focus:border-pink-500/50 placeholder:text-gray-600"
                    />
                </div>

                {/* Generated Image Display */}
                {data.imageUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-emerald-500/30">
                        <img
                            src={data.imageUrl}
                            alt="Generated"
                            className="w-full h-auto object-cover max-h-[200px]"
                        />
                        <div className="bg-emerald-500/10 p-2 text-xs text-emerald-400 text-center">
                            Generated in {(data.duration / 1000).toFixed(1)}s
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {data.error && (
                    <div className="mt-3 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-xs text-red-400">
                        {data.error}
                    </div>
                )}
            </div>
        </BaseNode>
    );
});
