'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Link2, Plus, X } from 'lucide-react';
import BaseNode from './BaseNode';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useWorkflowStore } from '@/stores/workflow-store';

export default memo(function MergeNode({ id, data }: NodeProps) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
    const numInputs = data.numInputs || 2;

    const addInput = useCallback(() => {
        if (numInputs < 5) {
            updateNodeData(id, { numInputs: numInputs + 1 });
        }
    }, [numInputs, id, updateNodeData]);

    const removeInput = useCallback(() => {
        if (numInputs > 2) {
            updateNodeData(id, { numInputs: numInputs - 1 });
        }
    }, [numInputs, id, updateNodeData]);

    // Generate dynamic inputs
    const inputs = Array.from({ length: numInputs }, (_, i) => ({
        id: `input_${i}`,
        label: `Input ${i + 1}`,
    }));

    return (
        <BaseNode
            title={data.label || 'Merge'}
            label={data.label}
            icon={<Link2 className="w-4 h-4 text-blue-400" />}
            inputs={inputs}
            outputs={[{ id: 'output', label: 'Merged' }]}
            isRunning={data.isRunning}
            isSuccess={data.mergedOutput}
            nodeType="logic"
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-gray-500 uppercase">
                        Inputs: {numInputs}
                    </Label>
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={removeInput}
                            disabled={numInputs <= 2}
                            className="h-6 w-6 border-[#1e293b] bg-[#0a0f1a] text-gray-400 hover:text-white hover:bg-[#1e293b]"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={addInput}
                            disabled={numInputs >= 5}
                            className="h-6 w-6 border-[#1e293b] bg-[#0a0f1a] text-gray-400 hover:text-white hover:bg-[#1e293b]"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                <p className="text-xs text-gray-500">
                    Merge multiple inputs into a single output. Connect 2-5 inputs.
                </p>

                {data.mergedOutput && (
                    <div className="mt-3 p-2 rounded-lg border border-blue-500/30 bg-blue-500/5">
                        <span className="text-xs font-medium text-blue-400">
                            Merged {numInputs} inputs
                        </span>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});