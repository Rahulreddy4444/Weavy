'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Video, Loader2 } from 'lucide-react';
import BaseNode from './BaseNode';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Label } from '@/components/ui/label';

export default memo(function TextToVideoNode({ id, data }: NodeProps) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

    const handlePromptChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            updateNodeData(id, { prompt: e.target.value });
        },
        [id, updateNodeData]
    );

    return (
        <BaseNode
            title={data.label || 'Text to Video'}
            label={data.label}
            icon={<Video className="w-4 h-4 text-orange-400" />}
            inputs={[{ id: 'prompt', label: 'Prompt' }]}
            outputs={[{ id: 'video', label: 'Video' }]}
            isRunning={data.isRunning}
            isSuccess={!!data.videoUrl}
            nodeType="transform"
        >
            <div className="space-y-4">
                {/* Prompt Input */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500 uppercase flex items-center justify-between">
                        <span>Prompt</span>
                        <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                            Connect to 'Prompt'
                        </span>
                    </Label>
                    <Textarea
                        value={data.prompt || ''}
                        onChange={handlePromptChange}
                        placeholder="Describe the video you want to generate..."
                        className="text-sm min-h-[80px] bg-[#0a0f1a] border-[#1e293b] text-gray-300 resize-none focus:border-orange-500/50 placeholder:text-gray-600"
                    />
                </div>

                {/* Generated Video Display */}
                {data.videoUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-emerald-500/30">
                        <video
                            src={data.videoUrl}
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-auto max-h-[200px]"
                        />
                        <div className="bg-emerald-500/10 p-2 text-xs text-emerald-400 text-center">
                            Generated in {(data.duration / 1000).toFixed(1)}s
                        </div>
                    </div>
                )}

                {/* Warning Display */}
                {data.warning && (
                    <div className="mt-3 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-400">
                        {data.warning}
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
