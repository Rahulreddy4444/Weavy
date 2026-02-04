export type NodeType = 
  | 'textNode'
  | 'uploadImageNode'
  | 'uploadVideoNode'
  | 'llmNode'
  | 'cropImageNode'
  | 'extractFrameNode';

export interface TextNodeData {
  text: string;
}

export interface UploadImageNodeData {
  imageUrl?: string;
  fileName?: string;
}

export interface UploadVideoNodeData {
  videoUrl?: string;
  fileName?: string;
}

export interface LLMNodeData {
  model: string;
  systemPrompt?: string;
  userMessage?: string;
  response?: string;
  isRunning?: boolean;
}

export interface CropImageNodeData {
  imageUrl?: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  croppedUrl?: string;
}

export interface ExtractFrameNodeData {
  videoUrl?: string;
  timestamp: string; // "50%" or "5" (seconds)
  extractedFrameUrl?: string;
}

export type WorkflowNodeData = 
  | TextNodeData 
  | UploadImageNodeData 
  | UploadVideoNodeData 
  | LLMNodeData 
  | CropImageNodeData 
  | ExtractFrameNodeData;

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
  status: 'success' | 'failed' | 'running';
  output?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}