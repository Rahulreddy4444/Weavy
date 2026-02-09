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
  headerColor?: string;
}

export default memo(function BaseNode({
  children,
  title,
  icon,
  inputs = [],
  outputs = [],
  isRunning = false,
  className,
  headerColor = 'from-blue-500/20 to-purple-500/20',
}: BaseNodeProps) {
  return (
    <div
      className={cn(
        'bg-[hsl(var(--node-bg))] rounded-lg border-2 border-[hsl(var(--node-border))] min-w-[300px] shadow-xl backdrop-blur-sm',
        isRunning && 'node-running border-primary',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center gap-2 px-4 py-3 bg-gradient-to-r rounded-t-lg border-b border-[hsl(var(--node-border))]',
        headerColor
      )}>
        {icon && (
          <div className="flex-shrink-0 text-primary">
            {icon}
          </div>
        )}
        <span className="font-semibold text-sm text-foreground flex-1">
          {title}
        </span>
        {isRunning && (
          <div className="flex-shrink-0">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Input Handles */}
      {inputs.map((input, index) => (
        <div
          key={input.id}
          className="absolute left-0"
          style={{ 
            top: `${40 + (index * 50)}px`
          }}
        >
          <Handle
            type="target"
            position={Position.Left}
            id={input.id}
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[hsl(var(--node-bg))] hover:!scale-125 transition-transform"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap pointer-events-none">
            {input.label}
          </div>
        </div>
      ))}

      {/* Content */}
      <div className="p-4">
        {children}
      </div>

      {/* Output Handles */}
      {outputs.map((output, index) => (
        <div
          key={output.id}
          className="absolute right-0"
          style={{ 
            top: `${40 + (index * 50)}px`
          }}
        >
          <Handle
            type="source"
            position={Position.Right}
            id={output.id}
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-[hsl(var(--node-bg))] hover:!scale-125 transition-transform"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap pointer-events-none">
            {output.label}
          </div>
        </div>
      ))}
    </div>
  );
});