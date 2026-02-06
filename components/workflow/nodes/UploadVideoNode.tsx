// 'use client';

// import { memo, useCallback, useState } from 'react';
// import { NodeProps } from 'reactflow';
// import { Video, Upload } from 'lucide-react';
// import BaseNode from './BaseNode';
// import { Button } from '@/components/ui/button';
// import { useWorkflowStore } from '@/stores/workflow-store';
// import { toast } from 'sonner';

// export default memo(function UploadVideoNode({ id, data }: NodeProps) {
//   const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
//   const [uploading, setUploading] = useState(false);

//   const handleFileChange = useCallback(
//     async (e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (!file) return;

//       // Validate file type
//       const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
//       if (!validTypes.includes(file.type)) {
//         toast.error('Invalid file type. Please upload mp4, mov, webm, or m4v');
//         return;
//       }

//       setUploading(true);
      
//       try {
//         const formData = new FormData();
//         formData.append('file', file);

//         const response = await fetch('/api/upload/video', {
//           method: 'POST',
//           body: formData,
//         });

//         if (!response.ok) throw new Error('Upload failed');

//         const { url } = await response.json();
        
//         updateNodeData(id, {
//           videoUrl: url,
//           fileName: file.name,
//         });
        
//         toast.success('Video uploaded successfully');
//       } catch (error) {
//         toast.error('Failed to upload video');
//         console.error(error);
//       } finally {
//         setUploading(false);
//       }
//     },
//     [id, updateNodeData]
//   );

//   return (
//     <BaseNode
//       title="Upload Video"
//       icon={<Video className="w-4 h-4" />}
//       outputs={[{ id: 'output', label: 'Video URL' }]}
//       isRunning={data.isRunning || uploading}
//     >
//       <div className="space-y-2">
//         <input
//           type="file"
//           accept=".mp4,.mov,.webm,.m4v"
//           onChange={handleFileChange}
//           className="hidden"
//           id={`file-input-${id}`}
//           disabled={uploading}
//         />
        
//         <label htmlFor={`file-input-${id}`}>
//           <Button
//             type="button"
//             variant="outline"
//             className="w-full cursor-pointer"
//             disabled={uploading}
//             asChild
//           >
//             <div>
//               <Upload className="w-4 h-4 mr-2" />
//               {uploading ? 'Uploading...' : 'Choose Video'}
//             </div>
//           </Button>
//         </label>

//         {data.videoUrl && (
//           <div className="mt-2 rounded border">
//             <video
//               src={data.videoUrl}
//               controls
//               className="w-full h-32 rounded"
//             />
//             <p className="text-xs text-gray-500 p-2 truncate">{data.fileName}</p>
//           </div>
//         )}
//       </div>
//     </BaseNode>
//   );
// });

'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps } from 'reactflow';
import { Video, Upload } from 'lucide-react';
import BaseNode from './BaseNode';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

export default memo(function UploadVideoNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload mp4, mov, webm, or m4v');
        return;
      }

      setUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/video', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const { url } = await response.json();
        
        updateNodeData(id, {
          videoUrl: url,
          fileName: file.name,
        });
        
        toast.success('Video uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload video');
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      title="Upload Video"
      icon={<Video className="w-4 h-4" />}
      outputs={[{ id: 'output', label: 'Video URL' }]}
      isRunning={data.isRunning || uploading}
    >
      <div className="space-y-2">
        <input
          type="file"
          accept=".mp4,.mov,.webm,.m4v"
          onChange={handleFileChange}
          className="hidden"
          id={`file-input-${id}`}
          disabled={uploading}
        />
        
        <label htmlFor={`file-input-${id}`}>
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer"
            disabled={uploading}
            asChild
          >
            <div>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose Video'}
            </div>
          </Button>
        </label>

        {data.videoUrl && (
          <div className="mt-2 rounded border">
            <video
              src={data.videoUrl}
              controls
              className="w-full h-32 rounded"
            />
            <p className="text-xs text-gray-500 p-2 truncate">{data.fileName}</p>
          </div>
        )}
      </div>
    </BaseNode>
  );
});