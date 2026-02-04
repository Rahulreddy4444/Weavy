'use client';

import { useState } from 'react';
import { 
  Type, 
  Image, 
  Video, 
  Sparkles, 
  Crop, 
  Film,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useWorkflowStore } from '@/stores/workflow-store';

const NODE_TYPES = [
  {
    type: 'textNode',
    label: 'Text Node',
    icon: Type,
    description: 'Simple text input with output handle',
  },
  {
    type: 'uploadImageNode',
    label: 'Upload Image',
    icon: Image,
    description: 'Upload images via Transloadit',
  },
  {
    type: 'uploadVideoNode',
    label: 'Upload Video',
    icon: Video,
    description: 'Upload videos via Transloadit',
  },
  {
    type: 'llmNode',
    label: 'Run LLM',
    icon: Sparkles,
    description: 'Execute AI model via Gemini',
  },
  {
    type: 'cropImageNode',
    label: 'Crop Image',
    icon: Crop,
    description: 'Crop images with custom parameters',
  },
  {
    type: 'extractFrameNode',
    label: 'Extract Frame',
    icon: Film,
    description: 'Extract frame from video',
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const addNode = useWorkflowStore((state) => state.addNode);

  const filteredNodes = NODE_TYPES.filter((node) =>
    node.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNode = (type: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {},
    };

    addNode(newNode);
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Node Library</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-xs font-medium text-gray-500 mb-2">QUICK ACCESS</p>
      </div>

      {/* Node List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredNodes.map((node) => {
            const Icon = node.icon;
            return (
              <button
                key={node.type}
                onClick={() => handleAddNode(node.type)}
                className="w-full text-left p-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {node.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {node.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}