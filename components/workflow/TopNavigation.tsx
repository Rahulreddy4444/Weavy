'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useReactFlow } from 'reactflow';
import {
    ArrowLeft,
    LayoutDashboard,
    Wand2,
    FileText,
    Search,
    Bell,
    Moon,
    Sun,
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
    Zap,
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
    const { nodes, edges, selectedNodes } = useWorkflowStore();

    const [isDarkTheme, setIsDarkTheme] = useState(true);
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

    const handleThemeToggle = () => {
        setIsDarkTheme(!isDarkTheme);
        toast.success(`Switched to ${!isDarkTheme ? 'dark' : 'light'} theme`);
    };

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
            <header className="h-16 bg-[#0a0f1a] border-b border-[#1e293b] flex items-center justify-between px-4 z-50 relative">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/workflows')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">Weavy</span>
                            <span className="px-1.5 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">
                                PRO
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1 ml-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={() => router.push('/workflows')}
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white bg-white/10"
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Editor Demo
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Templates
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-white/5"
                        >
                            Feature Roadmap
                        </Button>
                    </nav>
                </div>

                {/* Center Section - Workflow Info */}
                <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={() => router.push('/workflows')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="text-center">
                            <h1 className="font-semibold text-white text-sm">
                                {workflowName || 'Untitled Workflow'}
                            </h1>
                            <p className="text-xs text-gray-500">
                                {lastSaved ? `Last saved ${lastSaved}` : 'Auto-save ON'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Canvas Controls */}
                    <div className="hidden lg:flex items-center gap-1 mr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5">
                            <Undo2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5">
                            <Redo2 className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-4 bg-gray-700 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={handleZoomOut}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-gray-400 min-w-[40px] text-center">100%</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={handleZoomIn}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={handleFitView}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-4 bg-gray-700 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={onSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={handleExport}
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                            onClick={handleImport}
                        >
                            <Upload className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Search & Actions */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                        onClick={() => setShowSearch(true)}
                    >
                        <Search className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5 relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                        onClick={handleThemeToggle}
                    >
                        {isDarkTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </Button>

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
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-20">
                    <div className="bg-[#111827] border border-[#1e293b] rounded-lg w-[500px] shadow-2xl">
                        <form onSubmit={handleSearch} className="p-4">
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-gray-500" />
                                <Input
                                    autoFocus
                                    placeholder="Search nodes by name or type..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowSearch(false)}
                                    className="text-gray-500 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </form>
                        <div className="border-t border-[#1e293b] px-4 py-2 text-xs text-gray-500">
                            Press Enter to search • Esc to close
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Panel */}
            {showNotifications && (
                <div className="fixed top-16 right-4 w-80 bg-[#111827] border border-[#1e293b] rounded-lg shadow-2xl z-[100]">
                    <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowNotifications(false)}
                            className="h-6 w-6 text-gray-500 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-[#1e293b] hover:bg-white/5 cursor-pointer ${!notification.read ? 'bg-indigo-500/5' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {!notification.read && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{notification.title}</p>
                                            <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 border-t border-[#1e293b]">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-gray-400 hover:text-white"
                            onClick={() => toast.success('All notifications marked as read')}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Mark all as read
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}