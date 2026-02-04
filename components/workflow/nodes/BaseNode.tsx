import { memo, ReactNode } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface BaseNodeProps {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
  inputs?: Array<{ id: string; label: string }>;
  outputs?: Array<{ id: string; label: string }>;
  isRunning?: boolean;
  className?: string;
}

export default memo(function BaseNode({
  children,
  title,
  icon,
  inputs = [],
  outputs = [],
  isRunning = false,
  className,
}: BaseNodeProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-lg border-2 border-gray-200 min-w-[280px]',
        isRunning && 'ring-2 ring-blue-500 animate-pulse',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        {icon && <div className="text-gray-600">{icon}</div>}
        <span className="font-medium text-sm">{title}</span>
      </div>

      {/* Input Handles */}
      {inputs.map((input, index) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{ top: `${((index + 1) / (inputs.length + 1)) * 100}%` }}
          className="w-3 h-3 bg-blue-500 border-2 border-white"
        />
      ))}

      {/* Content */}
      <div className="p-3">{children}</div>

      {/* Output Handles */}
      {outputs.map((output, index) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{ top: `${((index + 1) / (outputs.length + 1)) * 100}%` }}
          className="w-3 h-3 bg-green-500 border-2 border-white"
        />
      ))}
    </div>
  );
});