'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps } from 'reactflow';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
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

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10MB');
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
          fileSize: file.size,
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

  const handleClear = useCallback(() => {
    updateNodeData(id, {
      imageUrl: undefined,
      fileName: undefined,
      fileSize: undefined,
    });
  }, [id, updateNodeData]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <BaseNode
      title="Upload Image"
      icon={<ImageIcon className="w-4 h-4" />}
      outputs={[{ id: 'output', label: 'Image' }]}
      isRunning={data.isRunning || uploading}
      headerColor="from-green-500/20 to-emerald-500/20"
    >
      <div className="space-y-3">
        {!data.imageUrl ? (
          <>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              onChange={handleFileChange}
              className="hidden"
              id={`file-input-${id}`}
              disabled={uploading}
            />
            
            <label htmlFor={`file-input-${id}`}>
              <div className="cursor-pointer group">
                <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    {uploading ? 'Uploading...' : 'Click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP, GIF (max 10MB)
                  </p>
                </div>
              </div>
            </label>
          </>
        ) : (
          <div className="space-y-2">
            <div className="node-image-preview rounded-lg overflow-hidden border border-border">
              <img
                src={data.imageUrl}
                alt={data.fileName || 'Uploaded'}
                className="w-full h-48 object-cover"
              />
            </div>

            <div className="flex items-center justify-between px-2 py-1.5 bg-secondary/30 rounded text-xs">
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium truncate">
                  {data.fileName}
                </p>
                {data.fileSize && (
                  <p className="text-muted-foreground">
                    {formatFileSize(data.fileSize)}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              onChange={handleFileChange}
              className="hidden"
              id={`file-input-replace-${id}`}
              disabled={uploading}
            />
            
            <label htmlFor={`file-input-replace-${id}`}>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                asChild
              >
                <div className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Replace Image'}
                </div>
              </Button>
            </label>
          </div>
        )}
      </div>
    </BaseNode>
  );
});