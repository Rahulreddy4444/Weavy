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
  Layers,
  Zap,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowStore } from '@/stores/workflow-store';

const QUICK_ACCESS = [
  {
    type: 'textNode',
    label: 'Text',
    icon: Type,
    color: 'from-blue-500 to-blue-600',
  },
  {
    type: 'llmNode',
    label: 'AI Model',
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600',
  },
  {
    type: 'uploadImageNode',
    label: 'Image',
    icon: Image,
    color: 'from-green-500 to-green-600',
  },
];

const NODE_CATEGORIES = [
  {
    category: 'Input',
    icon: FileText,
    nodes: [
      {
        type: 'textNode',
        label: 'Text',
        icon: Type,
        description: 'Text input with output',
        color: 'from-blue-500 to-blue-600',
      },
      {
        type: 'uploadImageNode',
        label: 'Upload Image',
        icon: Image,
        description: 'Upload images',
        color: 'from-green-500 to-green-600',
      },
      {
        type: 'uploadVideoNode',
        label: 'Upload Video',
        icon: Video,
        description: 'Upload videos',
        color: 'from-amber-500 to-amber-600',
      },
    ],
  },
  {
    category: 'AI & Processing',
    icon: Zap,
    nodes: [
      {
        type: 'llmNode',
        label: 'Run LLM',
        icon: Sparkles,
        description: 'Multi-model AI (GPT, Claude, Gemini)',
        color: 'from-purple-500 to-purple-600',
      },
    ],
  },
  {
    category: 'Image Tools',
    icon: Layers,
    nodes: [
      {
        type: 'cropImageNode',
        label: 'Crop Image',
        icon: Crop,
        description: 'Crop with parameters',
        color: 'from-pink-500 to-pink-600',
      },
      {
        type: 'extractFrameNode',
        label: 'Extract Frame',
        icon: Film,
        description: 'Extract video frame',
        color: 'from-cyan-500 to-cyan-600',
      },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Input', 'AI & Processing', 'Image Tools'])
  );
  const addNode = useWorkflowStore((state) => state.addNode);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  const handleAddNode = (type: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {},
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
      <div className="w-14 bg-[hsl(var(--sidebar-bg))] border-r border-border flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 flex flex-col gap-3">
          {NODE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.category}
                className="p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-all"
                title={cat.category}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-[hsl(var(--sidebar-bg))] border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Nodes</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-background/50 border-border"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Quick Access */}
        <div className="p-3 border-b border-border">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACCESS.map((node) => {
              const Icon = node.icon;
              return (
                <button
                  key={node.type}
                  onClick={() => handleAddNode(node.type)}
                  className="p-3 rounded-lg border border-border bg-card/30 hover:bg-card hover:border-primary/50 transition-all group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-md bg-gradient-to-br ${node.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      {node.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Node categories */}
        <div className="p-3 space-y-4">
          {filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            const isExpanded = expandedCategories.has(category.category);

            return (
              <div key={category.category}>
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                >
                  <CategoryIcon className="h-3.5 w-3.5" />
                  <span className="flex-1 text-left uppercase tracking-wider">
                    {category.category}
                  </span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Category nodes */}
                {isExpanded && (
                  <div className="space-y-1.5">
                    {category.nodes.map((node) => {
                      const Icon = node.icon;
                      return (
                        <button
                          key={node.type}
                          onClick={() => handleAddNode(node.type)}
                          className="w-full group sidebar-item p-3 rounded-lg border border-border bg-card/30 hover:bg-card text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-md bg-gradient-to-br ${node.color} flex-shrink-0`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {node.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {node.description}
                              </p>
                            </div>
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
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No nodes found</p>
          </div>
        )}
      </ScrollArea>

      {/* Footer info */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Click to add node to canvas</p>
        </div>
      </div>
    </div>
  );
}