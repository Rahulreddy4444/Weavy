'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useReactFlow, useViewport } from 'reactflow';
import {
    ArrowLeft,
    LayoutDashboard,
    Zap,
    Search,
    Bell,
    Undo2,
    Redo2,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Save,
    Download,
    Upload,
    Play,
    Loader2,
    X,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkflowStore } from '@/stores/workflow-store';
import { toast } from 'sonner';

interface TopNavigationProps {
    workflowId: string;
    workflowName: string;
    workflowDescription?: string;
    lastSaved?: string;
    onRun: () => void;
    onSave: () => void;
    isRunning: boolean;
    isSaving: boolean;
}

export default function TopNavigation({
    workflowId,
    workflowName,
    workflowDescription,
    lastSaved,
    onRun,
    onSave,
    isRunning,
    isSaving,
}: TopNavigationProps) {
    const router = useRouter();
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const { zoom } = useViewport();
    const { nodes, edges, selectedNodes } = useWorkflowStore();

    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications] = useState([
        { id: 1, title: 'Workflow completed', message: 'Run #6m1fdx finished successfully', time: '2 min ago', read: false },
        { id: 2, title: 'New template available', message: 'Check out the new AI content template', time: '1 hour ago', read: true },
    ]);

    const handleZoomIn = useCallback(() => {
        zoomIn({ duration: 200 });
    }, [zoomIn]);

    const handleZoomOut = useCallback(() => {
        zoomOut({ duration: 200 });
    }, [zoomOut]);

    const handleFitView = useCallback(() => {
        fitView({ duration: 200, padding: 0.2 });
    }, [fitView]);

    // ...

    // ...

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Search for nodes by label or type
            const foundNode = nodes.find(n =>
                n.data.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.type?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (foundNode) {
                // Select and focus on the found node
                useWorkflowStore.getState().setSelectedNodes([foundNode.id]);
                fitView({ nodes: [foundNode], duration: 500, padding: 0.3 });
                toast.success(`Found: ${foundNode.data.label || foundNode.type}`);
                setShowSearch(false);
                setSearchQuery('');
            } else {
                toast.error('No node found matching your search');
            }
        }
    };

    const handleExport = () => {
        const workflow = {
            nodes,
            edges,
            version: '1.0',
            exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(workflow, null, 2)], {
            type: 'application/json',
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow-${workflowId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Workflow exported successfully');
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const workflow = JSON.parse(text);

                if (!workflow.nodes || !workflow.edges) {
                    throw new Error('Invalid workflow file');
                }

                useWorkflowStore.getState().setNodes(workflow.nodes);
                useWorkflowStore.getState().setEdges(workflow.edges);

                toast.success('Workflow imported successfully');
            } catch (error) {
                toast.error('Failed to import workflow');
            }
        };

        input.click();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-4 z-50 relative">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/workflows')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Weavy</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1 ml-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground hover:bg-accent ml-25"
                            onClick={() => router.push('/workflows')}
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                    </nav>
                </div>

                {/* Center Section - Workflow Info */}
                <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={() => router.push('/workflows')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="text-center">
                            <h1 className="font-semibold text-foreground text-sm">
                                {workflowName || 'Untitled Workflow'}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {lastSaved ? `Last saved ${lastSaved}` : 'Auto-save ON'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Canvas Controls */}
                    <div className="hidden lg:flex items-center gap-1 mr-2">
                        {/* <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                            <Undo2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                            <Redo2 className="w-4 h-4" />
                        </Button> */}
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent "
                            onClick={handleZoomOut}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={handleZoomIn}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={handleFitView}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={onSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={handleExport}
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={handleImport}
                        >
                            <Upload className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Search & Actions */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                        onClick={() => setShowSearch(true)}
                    >
                        <Search className="w-4 h-4" />
                    </Button>
                    {/* <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </Button> */}
                    {/* Run Button */}
                    <Button
                        onClick={onRun}
                        disabled={isRunning || nodes.length === 0}
                        className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Run {selectedNodes.length > 0 && `(${selectedNodes.length})`}
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Search Modal */}
            {showSearch && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-start justify-center pt-20">
                    <div className="bg-card border border-border rounded-lg w-[500px] shadow-2xl">
                        <form onSubmit={handleSearch} className="p-4">
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-muted-foreground" />
                                <Input
                                    autoFocus
                                    placeholder="Search nodes by name or type..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowSearch(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </form>
                        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                            Press Enter to search • Esc to close
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Panel */}
            {/* {showNotifications && (
                <div className="fixed top-16 right-4 w-80 bg-card border border-border rounded-lg shadow-2xl z-[100]">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">Notifications</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowNotifications(false)}
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-border hover:bg-accent cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">{notification.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 border-t border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground hover:text-foreground"
                            onClick={() => toast.success('All notifications marked as read')}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Mark all as read
                        </Button>
                    </div>
                </div>
            )} */}
        </>
    );
}