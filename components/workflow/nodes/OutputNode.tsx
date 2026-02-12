'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { FileOutput, Eye, Copy, CheckCircle2 } from 'lucide-react';
import BaseNode from './BaseNode';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

export default memo(function OutputNode({ id, data }: NodeProps) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

    const handleCopyOutput = useCallback(() => {
        if (data.output) {
            navigator.clipboard.writeText(typeof data.output === 'string' ? data.output : JSON.stringify(data.output, null, 2));
            toast.success('Output copied to clipboard');
        }
    }, [data.output]);

    return (
        <BaseNode
            title={data.label || 'Final Output'}
            label={data.label}
            icon={<FileOutput className="w-4 h-4 text-amber-400" />}
            inputs={[{ id: 'input', label: 'Input' }]}
            outputs={[]}
            isRunning={data.isRunning}
            isSuccess={data.output}
            nodeType="output"
        >
            <div className="space-y-3">
                {!data.output ? (
                    <div className="text-center py-4">
                        <Eye className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                            Connect an input to display output
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Image Output */}
                        {data.output?.imageUrl && (
                            <div className="space-y-2 mb-4">
                                <Label className="text-xs font-medium text-gray-500 uppercase">
                                    Result Image
                                </Label>
                                <div className="rounded-lg overflow-hidden border border-[#1e293b]">
                                    <img
                                        src={data.output.imageUrl}
                                        alt="Output"
                                        className="w-full h-auto max-h-64 object-contain bg-[#0a0f1a]"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-gray-500 uppercase">
                                    JSON Output
                                </Label>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCopyOutput}
                                    className="h-6 px-2 text-gray-400 hover:text-white"
                                >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                </Button>
                            </div>
                            <div className="p-3 rounded-lg bg-[#0a0f1a] border border-[#1e293b] max-h-48 overflow-y-auto">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono text-xs">
                                    {typeof data.output === 'string'
                                        ? data.output
                                        : JSON.stringify(data.output, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-emerald-400">
                                Workflow completed successfully
                            </span>
                        </div>
                    </>
                )}
            </div>
        </BaseNode>
    );
});