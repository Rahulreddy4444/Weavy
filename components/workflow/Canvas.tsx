'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
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
import ConditionNode from './nodes/ConditionNode';
import LoopNode from './nodes/LoopNode';
import MergeNode from './nodes/MergeNode';
import OutputNode from './nodes/OutputNode';

const nodeTypes: NodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
  conditionNode: ConditionNode,
  loopNode: LoopNode,
  mergeNode: MergeNode,
  outputNode: OutputNode,
};

const defaultEdgeOptions = {
  animated: true,
  style: {
    stroke: '#6366f1',
    strokeWidth: 2,
    strokeDasharray: '5,5',
  },
};

export default function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodes,
  } = useWorkflowStore();

  const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    setSelectedNodes([node.id]);
  }, [setSelectedNodes]);

  const onPaneClick = useCallback(() => {
    setSelectedNodes([]);
  }, [setSelectedNodes]);

  return (
    <div className="w-full h-full bg-[#0a0f1a] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.1}
        maxZoom={2}
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1e293b"
        />
        <Controls
          showInteractive={false}
          className="bg-[#111827] border border-[#1e293b] rounded-lg"
        />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'textNode':
              case 'uploadImageNode':
              case 'uploadVideoNode':
                return '#10b981';
              case 'llmNode':
                return '#8b5cf6';
              case 'cropImageNode':
              case 'extractFrameNode':
                return '#ec4899';
              case 'conditionNode':
              case 'loopNode':
              case 'mergeNode':
                return '#3b82f6';
              case 'outputNode':
                return '#f59e0b';
              default:
                return '#6b7280';
            }
          }}
          className="bg-[#111827] border border-[#1e293b] rounded-lg"
          maskColor="rgba(10, 15, 26, 0.8)"
        />
      </ReactFlow>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#111827]/95 backdrop-blur-sm border border-[#1e293b] rounded-lg px-4 py-2 flex items-center gap-4 text-xs z-10">
        <span className="text-gray-400">
          <span className="text-white font-medium">{nodes.length}</span> nodes
        </span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-400">
          <span className="text-white font-medium">{edges.length}</span> connections
        </span>
        <span className="text-gray-600">|</span>
        <span className="text-indigo-400">
          Shift + Click to multi-select
        </span>
      </div>
    </div>
  );
}