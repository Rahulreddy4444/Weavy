'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';
import BaseNode from './BaseNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkflowStore } from '@/stores/workflow-store';

const CONDITIONS = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'notEmpty', label: 'Not Empty' },
    { value: 'isEmpty', label: 'Is Empty' },
];

export default memo(function ConditionNode({ id, data }: NodeProps) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

    const handleConditionChange = useCallback(
        (value: string) => {
            updateNodeData(id, { condition: value });
        },
        [id, updateNodeData]
    );

    const handleValueChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            updateNodeData(id, { value: e.target.value });
        },
        [id, updateNodeData]
    );

    return (
        <BaseNode
            title={data.label || 'Condition'}
            label={data.label}
            icon={<GitBranch className="w-4 h-4 text-blue-400" />}
            inputs={[{ id: 'input', label: 'Input' }]}
            outputs={[
                { id: 'true', label: 'True' },
                { id: 'false', label: 'False' },
            ]}
            isRunning={data.isRunning}
            isSuccess={data.result !== undefined}
            nodeType="logic"
        >
            <div className="space-y-3">
                <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase">
                        Condition
                    </Label>
                    <Select value={data.condition || 'equals'} onValueChange={handleConditionChange}>
                        <SelectTrigger className="w-full bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-blue-500/50">
                            <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111827] border-[#1e293b]">
                            {CONDITIONS.map((condition) => (
                                <SelectItem
                                    key={condition.value}
                                    value={condition.value}
                                    className="text-gray-300 focus:bg-[#1e293b] focus:text-white"
                                >
                                    {condition.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {!['notEmpty', 'isEmpty'].includes(data.condition) && (
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500 uppercase">
                            Value
                        </Label>
                        <Input
                            type="text"
                            value={data.value || ''}
                            onChange={handleValueChange}
                            placeholder="Enter comparison value..."
                            className="bg-[#0a0f1a] border-[#1e293b] text-gray-300 focus:border-blue-500/50"
                        />
                    </div>
                )}

                {data.result !== undefined && (
                    <div className="mt-3 p-2 rounded-lg border border-blue-500/30 bg-blue-500/5">
                        <span className="text-xs font-medium text-blue-400">
                            Result: {data.result ? 'True' : 'False'}
                        </span>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});