// 'use client';

// import { memo, useCallback } from 'react';
// import { NodeProps } from 'reactflow';
// import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
// import BaseNode from './BaseNode';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { useWorkflowStore } from '@/stores/workflow-store';
// import { Label } from '@/components/ui/label';

// // const GEMINI_MODELS = [
// //   { value: 'gemini-pro', label: 'Gemini Pro', badge: 'Fast' },
// //   { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', badge: 'Recommended' },
// //   { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro', badge: 'Advanced' },
// // ];


// const GEMINI_MODELS = [
//   { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'Recommended'},
//   { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', badge: 'Advanced' },
// ];



// export default memo(function LLMNode({ id, data }: NodeProps) {
//   const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

//   const handleModelChange = useCallback(
//     (value: string) => {
//       updateNodeData(id, { model: value });
//     },
//     [id, updateNodeData]
//   );

//   const handleSystemPromptChange = useCallback(
//     (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//       updateNodeData(id, { systemPrompt: e.target.value });
//     },
//     [id, updateNodeData]
//   );

//   const handleUserMessageChange = useCallback(
//     (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//       updateNodeData(id, { userMessage: e.target.value });
//     },
//     [id, updateNodeData]
//   );

//   return (
//     <BaseNode
//       title="AI Model"
//       icon={<Sparkles className="w-4 h-4" />}
//       inputs={[
//         { id: 'system_prompt', label: 'System' },
//         { id: 'user_message', label: 'User' },
//         { id: 'images', label: 'Images' },
//       ]}
//       outputs={[{ id: 'output', label: 'Response' }]}
//       isRunning={data.isRunning}
//       headerColor="from-purple-500/20 to-pink-500/20"
//     >
//       <div className="space-y-3">
//         {/* Model Selection */}
//         <div>
//           <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
//             Model
//           </Label>
//           <Select value={data.model || 'gemini-1.5-flash'} onValueChange={handleModelChange}>
//             <SelectTrigger className="w-full bg-background/50 border-border">
//               <SelectValue placeholder="Select model" />
//             </SelectTrigger>
//             <SelectContent>
//               {GEMINI_MODELS.map((model) => (
//                 <SelectItem key={model.value} value={model.value}>
//                   <div className="flex items-center justify-between w-full">
//                     <span>{model.label}</span>
//                     <span className="ml-2 text-xs text-primary">{model.badge}</span>
//                   </div>
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* System Prompt */}
//         <div>
//           <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
//             System Prompt
//             <span className="ml-1 text-xs text-muted-foreground/60">(Optional)</span>
//           </Label>
//           <Textarea
//             value={data.systemPrompt || ''}
//             onChange={handleSystemPromptChange}
//             placeholder="You are a helpful AI assistant..."
//             className="text-sm min-h-[70px] bg-background/50 border-border resize-none"
//           />
//         </div>

//         {/* User Message */}
//         <div>
//           <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
//             User Message
//             <span className="ml-1 text-xs text-muted-foreground/60">(or connect input)</span>
//           </Label>
//           <Textarea
//             value={data.userMessage || ''}
//             onChange={handleUserMessageChange}
//             placeholder="Enter your message..."
//             className="text-sm min-h-[70px] bg-background/50 border-border resize-none"
//           />
//         </div>

//         {/* Response Display */}
//         {data.response && (
//           <div className="mt-3 p-3 rounded-lg border border-green-500/30 bg-green-500/5">
//             <div className="flex items-center gap-2 mb-2">
//               <CheckCircle2 className="w-4 h-4 text-green-500" />
//               <span className="text-xs font-medium text-green-500">
//                 AI Response
//               </span>
//             </div>
//             <div className="text-sm text-foreground/90 whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
//               {data.response}
//             </div>
//           </div>
//         )}

//         {/* Error Display */}
//         {data.error && (
//           <div className="mt-3 p-3 rounded-lg border border-red-500/30 bg-red-500/5">
//             <div className="flex items-center gap-2 mb-2">
//               <AlertCircle className="w-4 h-4 text-red-500" />
//               <span className="text-xs font-medium text-red-500">
//                 Error
//               </span>
//             </div>
//             <div className="text-sm text-foreground/90">
//               {data.error}
//             </div>
//           </div>
//         )}
//       </div>
//     </BaseNode>
//   );
// });






'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps } from 'reactflow';
import { Sparkles, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import BaseNode from './BaseNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/workflow-store';
import { Label } from '@/components/ui/label';

const AI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'Recommended'},
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', badge: 'Advanced' },
  { value: 'gemini-pro', label: 'Google Gemini Pro', provider: 'Google', badge: 'Fast' },
  // { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'Google', badge: 'Recommended' },
  { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro', provider: 'Google', badge: 'Advanced' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', badge: 'Powerful' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI', badge: 'Fast' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI', badge: 'Fast' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: 'Best' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', provider: 'Anthropic', badge: 'Fast' },
];

export default memo(function LLMNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [numInputs, setNumInputs] = useState(data.numInputs || 1);

  const handleModelChange = useCallback(
    (value: string) => {
      updateNodeData(id, { model: value });
    },
    [id, updateNodeData]
  );

  const handleSystemPromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { systemPrompt: e.target.value });
    },
    [id, updateNodeData]
  );

  const handleUserMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { userMessage: e.target.value });
    },
    [id, updateNodeData]
  );

  const addInput = useCallback(() => {
    const newNum = numInputs + 1;
    setNumInputs(newNum);
    updateNodeData(id, { numInputs: newNum });
  }, [numInputs, id, updateNodeData]);

  const removeInput = useCallback(() => {
    if (numInputs > 1) {
      const newNum = numInputs - 1;
      setNumInputs(newNum);
      updateNodeData(id, { numInputs: newNum });
    }
  }, [numInputs, id, updateNodeData]);

  // Generate dynamic inputs
  const inputs = Array.from({ length: numInputs }, (_, i) => ({
    id: `user_message_${i}`,
    label: `Input ${i + 1}`,
  }));

  inputs.unshift({ id: 'system_prompt', label: 'System' });
  inputs.push({ id: 'images', label: 'Images' });

  return (
    <BaseNode
      title="AI Model"
      icon={<Sparkles className="w-4 h-4" />}
      inputs={inputs}
      outputs={[{ id: 'output', label: 'Response' }]}
      isRunning={data.isRunning}
      headerColor="from-purple-500/20 to-pink-500/20"
    >
      <div className="space-y-3">
        {/* Model Selection */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Model
          </Label>
          <Select value={data.model || 'gemini-1.5-flash'} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full bg-background/50 border-border">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex items-center justify-between w-full gap-3">
                    <span>{model.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{model.provider}</span>
                      <span className="text-xs text-primary">{model.badge}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Inputs Control */}
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">
            Message Inputs: {numInputs}
          </Label>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="outline"
              onClick={removeInput}
              disabled={numInputs <= 1}
              className="h-6 w-6 border-border"
            >
              <X className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={addInput}
              className="h-6 w-6 border-border"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            System Prompt
            <span className="ml-1 text-xs text-muted-foreground/60">(Optional)</span>
          </Label>
          <Textarea
            value={data.systemPrompt || ''}
            onChange={handleSystemPromptChange}
            placeholder="You are a helpful AI assistant..."
            className="text-sm min-h-[70px] bg-background/50 border-border resize-none"
          />
        </div>

        {/* User Message */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            User Message
            <span className="ml-1 text-xs text-muted-foreground/60">(or connect inputs)</span>
          </Label>
          <Textarea
            value={data.userMessage || ''}
            onChange={handleUserMessageChange}
            placeholder="Enter your message..."
            className="text-sm min-h-[70px] bg-background/50 border-border resize-none"
          />
        </div>

        {/* Response Display */}
        {data.response && (
          <div className="mt-3 p-3 rounded-lg border border-green-500/30 bg-green-500/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-500">
                AI Response
              </span>
            </div>
            <div className="text-sm text-foreground/90 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {data.response}
            </div>
          </div>
        )}

        {/* Error Display */}
        {data.error && (
          <div className="mt-3 p-3 rounded-lg border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-red-500">
                Error
              </span>
            </div>
            <div className="text-sm text-foreground/90">
              {data.error}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});