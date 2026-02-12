export type NodeType =
  | 'textNode'
  | 'uploadImageNode'
  | 'uploadVideoNode'
  | 'llmNode'
  | 'cropImageNode'
  | 'extractFrameNode'
  | 'conditionNode'
  | 'loopNode'
  | 'mergeNode'
  | 'outputNode';

export interface TextNodeData {
  text: string;
  label?: string;
  isRunning?: boolean;
}

export interface UploadImageNodeData {
  imageUrl?: string;
  fileName?: string;
  fileSize?: number;
  label?: string;
  isRunning?: boolean;
}

export interface UploadVideoNodeData {
  videoUrl?: string;
  fileName?: string;
  fileSize?: number;
  label?: string;
  isRunning?: boolean;
}

export interface LLMNodeData {
  model: string;
  systemPrompt?: string;
  userMessage?: string;
  response?: string;
  temperature?: number;
  numInputs?: number;
  label?: string;
  isRunning?: boolean;
  duration?: number;
  error?: string;
}

export interface CropImageNodeData {
  imageUrl?: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  croppedUrl?: string;
  label?: string;
  isRunning?: boolean;
}

export interface ExtractFrameNodeData {
  videoUrl?: string;
  timestamp: string;
  extractedFrameUrl?: string;
  label?: string;
  isRunning?: boolean;
}

export interface ConditionNodeData {
  condition: string;
  value?: string;
  result?: boolean;
  label?: string;
  isRunning?: boolean;
}

export interface LoopNodeData {
  iterations: number;
  delay: number;
  currentIteration?: number;
  completed?: boolean;
  label?: string;
  isRunning?: boolean;
}

export interface MergeNodeData {
  numInputs: number;
  mergedOutput?: any;
  label?: string;
  isRunning?: boolean;
}

export interface OutputNodeData {
  output?: any;
  label?: string;
  isRunning?: boolean;
}

export type WorkflowNodeData =
  | TextNodeData
  | UploadImageNodeData
  | UploadVideoNodeData
  | LLMNodeData
  | CropImageNodeData
  | ExtractFrameNodeData
  | ConditionNodeData
  | LoopNodeData
  | MergeNodeData
  | OutputNodeData;

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowRunResult {
  nodeId: string;
  nodeType: string;
  status: 'success' | 'failed' | 'running';
  output?: any;
  error?: string;
  duration: number;
  timestamp: string;
}