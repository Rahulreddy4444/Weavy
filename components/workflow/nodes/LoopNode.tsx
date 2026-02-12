'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Repeat } from 'lucide-react';
import BaseNode from './BaseNode';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkflowStore } from '@/stores/workflow-store';

export default memo(function LoopNode({ id, data }: NodeProps) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

    const handleIterationsChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value) || 1;
            updateNodeData(id, { iterations: Math.max(1, Math.min(100, value)) });
        },
        [id, updateNodeData]
    );

    const handleDelayChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value) || 0;
            updateNodeData(id, { delay: Math.max(0, value) });
        },
        [id, updateNodeData]
    );

    return (
        <BaseNode
            title={data.label || 'Loop'}
            label={data.label}
            icon={<Repeat className="w-4 h-4 text-blue-400" />}
            inputs={[{ id: 'input', label: 'Input' }]}
            outputs={[{ id: 'output', label: 'Output' }]}
            isRunning={data.isRunning}
            isSuccess={data.completed}
            nodeType="logic"
        >
            <div className="space-y-3">
                <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase">
                        Iterations
                    </Label>
                    <Input
                        type="number"
                        min="1"
                        max="100"
                        value={data.iterations || 1}
                        onChange={handleIterationsChange}
                        className="bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-blue-500/50"
                    />
                    <p className="text-xs text-gray-500">
                        Number of times to iterate (1-100)
                    </p>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase">
                        Delay (ms)
                    </Label>
                    <Input
                        type="number"
                        min="0"
                        value={data.delay || 0}
                        onChange={handleDelayChange}
                        className="bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-blue-500/50"
                    />
                    <p className="text-xs text-gray-500">
                        Delay between iterations in milliseconds
                    </p>
                </div>

                {data.currentIteration !== undefined && (
                    <div className="mt-3 p-2 rounded-lg border border-blue-500/30 bg-blue-500/5">
                        <span className="text-xs font-medium text-blue-400">
                            Iteration: {data.currentIteration} / {data.iterations || 1}
                        </span>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});