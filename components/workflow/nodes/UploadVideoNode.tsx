'use client';

import { memo, useCallback, useState } from 'react';
import { NodeProps } from 'reactflow';
import { Video, Upload, X, Play } from 'lucide-react';
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

      if (file.size > 100 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 100MB');
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
          fileSize: file.size,
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

  const handleClear = useCallback(() => {
    updateNodeData(id, {
      videoUrl: undefined,
      fileName: undefined,
      fileSize: undefined,
    });
  }, [id, updateNodeData]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <BaseNode
      title="Upload Video"
      icon={<Video className="w-4 h-4" />}
      outputs={[{ id: 'output', label: 'Video' }]}
      isRunning={data.isRunning || uploading}
      headerColor="from-amber-500/20 to-orange-500/20"
    >
      <div className="space-y-3">
        {!data.videoUrl ? (
          <>
            <input
              type="file"
              accept=".mp4,.mov,.webm,.m4v"
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
                    MP4, MOV, WebM, M4V (max 100MB)
                  </p>
                </div>
              </div>
            </label>
          </>
        ) : (
          <div className="space-y-2">
            <div className="node-image-preview rounded-lg overflow-hidden border border-border bg-black">
              <div className="relative group">
                <video
                  src={data.videoUrl}
                  className="w-full h-48 object-cover"
                  controls
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:bg-black/20 transition-colors">
                  <Play className="w-12 h-12 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
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
              accept=".mp4,.mov,.webm,.m4v"
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
                  {uploading ? 'Uploading...' : 'Replace Video'}
                </div>
              </Button>
            </label>
          </div>
        )}
      </div>
    </BaseNode>
  );
});