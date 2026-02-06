// 'use client';

// import { memo, useCallback } from 'react';
// import { NodeProps } from 'reactflow';
// import { Type } from 'lucide-react';
// import BaseNode from './BaseNode';
// import { Textarea } from '@/components/ui/textarea';
// import { useWorkflowStore } from '@/stores/workflow-store';

// export default memo(function TextNode({ id, data }: NodeProps) {
//   const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//       updateNodeData(id, { text: e.target.value });
//     },
//     [id, updateNodeData]
//   );

//   return (
//     <BaseNode
//       title="Text Node"
//       icon={<Type className="w-4 h-4" />}
//       outputs={[{ id: 'output', label: 'Text Output' }]}
//       isRunning={data.isRunning}
//     >
//       <div className="space-y-2">
//         <Textarea
//           value={data.text || ''}
//           onChange={handleChange}
//           placeholder="Enter text..."
//           className="min-h-[100px] text-sm"
//         />
//       </div>
//     </BaseNode>
//   );
// });

'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Type } from 'lucide-react';
import BaseNode from './BaseNode';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/stores/workflow-store';

export default memo(function TextNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { text: e.target.value });
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      title="Text Node"
      icon={<Type className="w-4 h-4" />}
      outputs={[{ id: 'output', label: 'Text Output' }]}
      isRunning={data.isRunning}
    >
      <div className="space-y-2">
        <Textarea
          value={data.text || ''}
          onChange={handleChange}
          placeholder="Enter text..."
          className="min-h-[100px] text-sm"
        />
      </div>
    </BaseNode>
  );
});