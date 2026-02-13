'use client';

import { useState } from 'react';
import {
  Type,
  Image,
  Sparkles,
  Crop,
  Film,
  Search,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Repeat,
  Link2,
  FileOutput,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowStore } from '@/stores/workflow-store';

interface NodeItem {
  type: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  color: string;
}

interface NodeCategory {
  category: string;
  nodes: NodeItem[];
}

const NODE_CATEGORIES: NodeCategory[] = [
  {
    category: 'INPUT',
    nodes: [
      {
        type: 'textNode',
        label: 'Text Input',
        icon: Type,
        description: 'Text input with output',
        color: 'from-emerald-500 to-emerald-600',
      },
      {
        type: 'uploadImageNode',
        label: 'Upload Image',
        icon: Image,
        description: 'Upload and process images',
        color: 'from-emerald-500 to-emerald-600',
      },
      {
        type: 'uploadVideoNode',
        label: 'Upload Video',
        icon: Video,
        description: 'Upload and process videos',
        color: 'from-emerald-500 to-emerald-600',
      },
    ],
  },
  {
    category: 'AI',
    nodes: [
      {
        type: 'llmNode',
        label: 'AI Model',
        icon: Sparkles,
        description: 'Multi-model AI (GPT, Claude, Gemini)',
        color: 'from-violet-500 to-purple-600',
      },
    ],
  },
  {
    category: 'GENERATIVE',
    nodes: [
      {
        type: 'textToImageNode',
        label: 'Text to Image',
        icon: ImageIcon,
        description: 'Generate images from text',
        color: 'from-pink-500 to-rose-600',
      },
      {
        type: 'textToVideoNode',
        label: 'Text to Video',
        icon: Video,
        description: 'Generate videos from text',
        color: 'from-orange-500 to-red-600',
      },
    ],
  },
  {
    category: 'TRANSFORM',
    nodes: [
      {
        type: 'cropImageNode',
        label: 'Crop Image',
        icon: Crop,
        description: 'Crop images with parameters',
        color: 'from-pink-500 to-rose-600',
      },
      {
        type: 'extractFrameNode',
        label: 'Extract Frame',
        icon: Film,
        description: 'Extract frames from videos',
        color: 'from-pink-500 to-rose-600',
      },
    ],
  },
  {
    category: 'LOGIC',
    nodes: [
      {
        type: 'conditionNode',
        label: 'Condition',
        icon: GitBranch,
        description: 'Conditional branching',
        color: 'from-blue-500 to-blue-600',
      },
      {
        type: 'loopNode',
        label: 'Loop',
        icon: Repeat,
        description: 'Iterate over items',
        color: 'from-blue-500 to-blue-600',
      },
      {
        type: 'mergeNode',
        label: 'Merge',
        icon: Link2,
        description: 'Merge multiple inputs',
        color: 'from-blue-500 to-blue-600',
      },
    ],
  },
  {
    category: 'OUTPUT',
    nodes: [
      {
        type: 'outputNode',
        label: 'Final Output',
        icon: FileOutput,
        description: 'Display final results',
        color: 'from-amber-500 to-orange-600',
      },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['INPUT', 'AI', 'TRANSFORM', 'LOGIC', 'OUTPUT'])
  );
  const addNode = useWorkflowStore((state) => state.addNode);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleAddNode = (type: string, color: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100
      },
      data: {
        label: type.replace('Node', '').replace(/([A-Z])/g, ' $1').trim(),
        nodeColor: color,
      },
    };

    addNode(newNode);
  };

  const filteredCategories = NODE_CATEGORIES.map((cat) => ({
    ...cat,
    nodes: cat.nodes.filter((node) =>
      node.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.nodes.length > 0);

  if (collapsed) {
    return (
      <div className="w-14 bg-[#0f1623] border-r border-[#1e293b] flex flex-col items-center py-4 gap-4 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="text-gray-400 hover:text-white hover:bg-white/5"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
          {NODE_CATEGORIES.map((cat) => {
            const Icon = cat.nodes[0]?.icon || Type;
            return (
              <button
                key={cat.category}
                onClick={() => setCollapsed(false)}
                className="p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all"
                title={cat.category}
              >
                <Icon className="h-5 w-5 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#0f1623] border-r border-[#1e293b] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-[#1e293b] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-gray-300">NODES</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-[#1e293b]/50 border-[#1e293b] text-gray-300 placeholder:text-gray-500 focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.category);
            const CategoryIcon = category.nodes[0]?.icon || Type;

            return (
              <div key={category.category} className="mb-2">
                {/* Category Header - Clickable to toggle */}
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="w-full flex items-center justify-between px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors rounded hover:bg-white/5"
                >
                  <span>{category.category}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                {/* Category Nodes */}
                {isExpanded && (
                  <div className="space-y-1 mt-1">
                    {category.nodes.map((node) => {
                      const Icon = node.icon;
                      return (
                        <button
                          key={node.type}
                          onClick={() => handleAddNode(node.type, node.color)}
                          className="w-full group flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:border-[#1e293b] hover:bg-[#1e293b]/50 text-left transition-all"
                        >
                          <div className={`p-2 rounded-md bg-gradient-to-br ${node.color} flex-shrink-0`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                              {node.label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No results */}
        {filteredCategories.length === 0 && (
          <div className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No nodes found</p>
          </div>
        )}
      </ScrollArea>

      {/* Footer info */}
      <div className="p-3 border-t border-[#1e293b] flex-shrink-0">
        <div className="text-xs text-gray-500 text-center">
          <p>Click to add node to canvas</p>
        </div>
      </div>
    </div>
  );
}