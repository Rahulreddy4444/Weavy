'use client';

import { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import Canvas from '@/components/workflow/Canvas';
import { useWorkflowStore } from '@/stores/workflow-store';

const sampleNodes = [
    {
        id: 'node-1',
        type: 'textNode',
        position: { x: 50, y: 150 },
        data: { text: 'A futuristic city skyline at night with flying cars and neon lights' }
    },
    {
        id: 'node-2',
        type: 'textToImageNode',
        position: { x: 350, y: 150 },
        data: { prompt: '' }
    },
    {
        id: 'node-3',
        type: 'cropImageNode',
        position: { x: 650, y: 150 },
        data: { xPercent: 10, yPercent: 10, widthPercent: 80, heightPercent: 80 }
    },
    {
        id: 'node-4',
        type: 'outputNode',
        position: { x: 950, y: 150 },
        data: {}
    }
];

const sampleEdges = [
    { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: 'output', targetHandle: 'prompt' },
    { id: 'edge-2', source: 'node-2', target: 'node-3', sourceHandle: 'output', targetHandle: 'image' },
    { id: 'edge-3', source: 'node-3', target: 'node-4', sourceHandle: 'output', targetHandle: 'input' }
];

export default function HeroCanvas() {
    const setNodes = useWorkflowStore((s) => s.setNodes);
    const setEdges = useWorkflowStore((s) => s.setEdges);

    useEffect(() => {
        // Populate the global store with the sample workflow for the demo
        setNodes(sampleNodes);
        setEdges(sampleEdges);
    }, [setNodes, setEdges]);

    return (
        <div className="w-full h-full relative">
            <div className="absolute inset-0 z-20" /> {/* Transparent overlay to absorb clicks but allow scrolling if needed */}
            <ReactFlowProvider>
                <Canvas />
            </ReactFlowProvider>
        </div>
    );
}
