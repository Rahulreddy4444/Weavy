'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/stores/workflow-store';
import TextNode from './nodes/TextNode';
import UploadImageNode from './nodes/UploadImageNode';
import UploadVideoNode from './nodes/UploadVideoNode';
import LLMNode from './nodes/LLMNode';
import CropImageNode from './nodes/CropImageNode';
import ExtractFrameNode from './nodes/ExtractFrameNode';

const nodeTypes: NodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
};

const defaultEdgeOptions = {
  animated: true,
  style: { 
    stroke: 'hsl(210 100% 50% / 0.6)', 
    strokeWidth: 2 
  },
};

export default function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useWorkflowStore();

  const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    console.log('Node clicked:', node);
  }, []);

  return (
    <div className="w-full h-full bg-[hsl(var(--canvas-bg))]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.1}
        maxZoom={2}
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="hsl(var(--canvas-grid))"
        />
        <Controls 
          showInteractive={false}
          className="bg-card border border-border"
        />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'textNode':
                return '#3b82f6';
              case 'llmNode':
                return '#8b5cf6';
              case 'uploadImageNode':
                return '#10b981';
              case 'uploadVideoNode':
                return '#f59e0b';
              case 'cropImageNode':
                return '#ec4899';
              case 'extractFrameNode':
                return '#06b6d4';
              default:
                return '#6b7280';
            }
          }}
          className="bg-card border border-border"
          maskColor="hsl(var(--canvas-bg) / 0.8)"
        />
        
        <Panel position="bottom-left" className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{nodes.length} nodes</span>
            <span>•</span>
            <span>{edges.length} connections</span>
            <span>•</span>
            <span className="text-primary">Shift + Click to multi-select</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}