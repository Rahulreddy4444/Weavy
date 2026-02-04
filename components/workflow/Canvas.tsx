'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/stores/workflow-store';
import TextNode from './nodes/TextNode';
import UploadImageNode from './nodes/UploadImageNode';
import UploadVideoNode from './nodes/UploadVideoNode';
import LLMNode from './nodes/LLMNode';
import CropImageNode from './nodes/CropImageNode';
import ExtractFrameNode from './nodes/ExtractFrameNode';
import Toolbar from './Toolbar';

const nodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
};

export default function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useWorkflowStore();

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
        <Panel position="top-center">
          <Toolbar workflowId="" onRun={() => {}} onSave={() => {}} />
        </Panel>
      </ReactFlow>
    </div>
  );
}