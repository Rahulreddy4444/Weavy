// 'use client';

// import { memo, useCallback, useState } from 'react';
// import { NodeProps } from 'reactflow';
// import { Image as ImageIcon, Upload } from 'lucide-react';
// import BaseNode from './BaseNode';
// import { Button } from '@/components/ui/button';
// import { useWorkflowStore } from '@/stores/workflow-store';
// import { toast } from 'sonner';

// export default memo(function UploadImageNode({ id, data }: NodeProps) {
//   const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
//   const [uploading, setUploading] = useState(false);

//   const handleFileChange = useCallback(
//     async (e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (!file) return;

//       // Validate file type
//       const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
//       if (!validTypes.includes(file.type)) {
//         toast.error('Invalid file type. Please upload jpg, png, webp, or gif');
//         return;
//       }

//       setUploading(true);
      
//       try {
//         const formData = new FormData();
//         formData.append('file', file);

//         const response = await fetch('/api/upload/image', {
//           method: 'POST',
//           body: formData,
//         });

//         if (!response.ok) throw new Error('Upload failed');

//         const { url } = await response.json();
        
//         updateNodeData(id, {
//           imageUrl: url,
//           fileName: file.name,
//         });
        
//         toast.success('Image uploaded successfully');
//       } catch (error) {
//         toast.error('Failed to upload image');
//         console.error(error);
//       } finally {
//         setUploading(false);
//       }
//     },
//     [id, updateNodeData]
//   );

//   return (
//     <BaseNode
//       title="Upload Image"
//       icon={<ImageIcon className="w-4 h-4" />}
//       outputs={[{ id: 'output', label: 'Image URL' }]}
//       isRunning={data.isRunning || uploading}
//     >
//       <div className="space-y-2">
//         <input
//           type="file"
//           accept=".jpg,.jpeg,.png,.webp,.gif"
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
//               {uploading ? 'Uploading...' : 'Choose Image'}
//             </div>
//           </Button>
//         </label>

//         {data.imageUrl && (
//           <div className="mt-2 rounded border">
//             <img
//               src={data.imageUrl}
//               alt={data.fileName || 'Uploaded'}
//               className="w-full h-32 object-cover rounded"
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
import { Image as ImageIcon, Upload } from 'lucide-react';
import BaseNode from './BaseNode';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

export default memo(function UploadImageNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload jpg, png, webp, or gif');
        return;
      }

      setUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const { url } = await response.json();
        
        updateNodeData(id, {
          imageUrl: url,
          fileName: file.name,
        });
        
        toast.success('Image uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload image');
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      title="Upload Image"
      icon={<ImageIcon className="w-4 h-4" />}
      outputs={[{ id: 'output', label: 'Image URL' }]}
      isRunning={data.isRunning || uploading}
    >
      <div className="space-y-2">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif"
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
              {uploading ? 'Uploading...' : 'Choose Image'}
            </div>
          </Button>
        </label>

        {data.imageUrl && (
          <div className="mt-2 rounded border">
            <img
              src={data.imageUrl}
              alt={data.fileName || 'Uploaded'}
              className="w-full h-32 object-cover rounded"
            />
            <p className="text-xs text-gray-500 p-2 truncate">{data.fileName}</p>
          </div>
        )}
      </div>
    </BaseNode>
  );
});