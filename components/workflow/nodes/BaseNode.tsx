import { memo, ReactNode } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface BaseNodeProps {
  children: ReactNode;
  title: string;
  label?: string;
  icon?: ReactNode;
  inputs?: Array<{ id: string; label: string }>;
  outputs?: Array<{ id: string; label: string }>;
  isRunning?: boolean;
  isSuccess?: boolean;
  className?: string;
  headerColor?: string;
  nodeType?: 'input' | 'ai' | 'transform' | 'logic' | 'output';
}

const getHeaderGradient = (nodeType?: string) => {
  switch (nodeType) {
    case 'input':
      return 'from-emerald-500/20 to-emerald-600/10';
    case 'ai':
      return 'from-violet-500/20 to-purple-600/10';
    case 'transform':
      return 'from-pink-500/20 to-rose-600/10';
    case 'logic':
      return 'from-blue-500/20 to-blue-600/10';
    case 'output':
      return 'from-amber-500/20 to-orange-600/10';
    default:
      return 'from-gray-500/20 to-gray-600/10';
  }
};

const getBorderColor = (nodeType?: string, isRunning?: boolean, isSuccess?: boolean) => {
  if (isRunning) return 'border-indigo-500/50';
  if (isSuccess) return 'border-emerald-500/50';

  switch (nodeType) {
    case 'input':
      return 'border-emerald-500/30';
    case 'ai':
      return 'border-violet-500/30';
    case 'transform':
      return 'border-pink-500/30';
    case 'logic':
      return 'border-blue-500/30';
    case 'output':
      return 'border-amber-500/30';
    default:
      return 'border-gray-700';
  }
};

export default memo(function BaseNode({
  children,
  title,
  label,
  icon,
  inputs = [],
  outputs = [],
  isRunning = false,
  isSuccess = false,
  className,
  headerColor,
  nodeType = 'input',
}: BaseNodeProps) {
  const displayTitle = label || title;
  const headerGradient = headerColor || getHeaderGradient(nodeType);
  const borderColor = getBorderColor(nodeType, isRunning, isSuccess);

  return (
    <div
      className={cn(
        'bg-[#111827] rounded-xl border-2 min-w-[280px] shadow-xl backdrop-blur-sm overflow-hidden',
        borderColor,
        isRunning && 'node-running',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 bg-gradient-to-r border-b border-[#1e293b]/50',
        headerGradient
      )}>
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <span className="font-semibold text-sm text-white flex-1">
          {displayTitle}
        </span>
        {isSuccess && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        )}
        {isRunning && (
          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        )}
      </div>

      {/* Input Handles */}
      {inputs.map((input, index) => (
        <div
          key={input.id}
          className="absolute left-0 flex items-center"
          style={{
            top: `${50 + (index * 40)}px`
          }}
        >
          <Handle
            type="target"
            position={Position.Left}
            id={input.id}
            className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-[#111827] hover:!scale-125 transition-transform"
          />
          <span className="ml-4 text-xs text-gray-500 whitespace-nowrap">
            {input.label}
          </span>
        </div>
      ))}

      {/* Content */}
      <div className="p-4 pt-6">
        {children}
      </div>

      {/* Output Handles */}
      {outputs.map((output, index) => (
        <div
          key={output.id}
          className="absolute right-0 flex items-center"
          style={{
            top: `${50 + (index * 40)}px`
          }}
        >
          <span className="mr-4 text-xs text-gray-500 whitespace-nowrap">
            {output.label}
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id={output.id}
            className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[#111827] hover:!scale-125 transition-transform"
          />
        </div>
      ))}
    </div>
  );
});