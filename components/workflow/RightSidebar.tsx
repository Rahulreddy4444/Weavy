// 'use client';

// import { useState, useEffect } from 'react';
// import { formatDistanceToNow } from 'date-fns';
// import { 
//   ChevronRight, 
//   ChevronLeft,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Loader2,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from '@/components/ui/collapsible';

// interface WorkflowRun {
//   id: string;
//   status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
//   scope: 'FULL' | 'PARTIAL' | 'SINGLE';
//   startedAt: Date;
//   completedAt?: Date;
//   duration?: number;
//   nodeResults: any[];
// }

// interface Props {
//   workflowId: string;
// }

// export default function RightSidebar({ workflowId }: Props) {
//   const [collapsed, setCollapsed] = useState(false);
//   const [runs, setRuns] = useState<WorkflowRun[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchRuns();
//     // Poll for updates every 5 seconds
//     const interval = setInterval(fetchRuns, 5000);
//     return () => clearInterval(interval);
//   }, [workflowId]);

//   const fetchRuns = async () => {
//     try {
//       const response = await fetch(`/api/workflows/${workflowId}`);
//       const data = await response.json();
//       setRuns(data.workflow.workflowRuns || []);
//     } catch (error) {
//       console.error('Failed to fetch runs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'RUNNING':
//         return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
//       case 'SUCCESS':
//         return <CheckCircle2 className="h-4 w-4 text-green-500" />;
//       case 'FAILED':
//         return <XCircle className="h-4 w-4 text-red-500" />;
//       default:
//         return <Clock className="h-4 w-4 text-gray-400" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'RUNNING':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'SUCCESS':
//         return 'bg-green-100 text-green-800';
//       case 'FAILED':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (collapsed) {
//     return (
//       <div className="w-12 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => setCollapsed(false)}
//         >
//           <ChevronLeft className="h-4 w-4" />
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
//       {/* Header */}
//       <div className="p-4 border-b border-gray-200">
//         <div className="flex items-center justify-between">
//           <h2 className="font-semibold text-sm">Workflow History</h2>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setCollapsed(true)}
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Run List */}
//       <ScrollArea className="flex-1">
//         {loading ? (
//           <div className="flex items-center justify-center p-8">
//             <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
//           </div>
//         ) : runs.length === 0 ? (
//           <div className="p-8 text-center">
//             <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//             <p className="text-sm text-gray-500">No runs yet</p>
//           </div>
//         ) : (
//           <div className="p-3 space-y-2">
//             {runs.map((run) => (
//               <Collapsible key={run.id}>
//                 <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                   <CollapsibleTrigger className="w-full p-3 hover:bg-gray-50 transition-colors">
//                     <div className="flex items-start gap-3">
//                       {getStatusIcon(run.status)}
//                       <div className="flex-1 text-left">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-sm font-medium">
//                             Run #{run.id.slice(-6)}
//                           </span>
//                           <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(run.status)}`}>
//                             {run.status}
//                           </span>
//                         </div>
//                         <p className="text-xs text-gray-500">
//                           {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           {run.scope === 'FULL' ? 'Full Workflow' : 
//                            run.scope === 'PARTIAL' ? 'Selected Nodes' : 
//                            'Single Node'}
//                         </p>
//                         {run.duration && (
//                           <p className="text-xs text-gray-400">
//                             Duration: {(run.duration / 1000).toFixed(2)}s
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </CollapsibleTrigger>

//                   <CollapsibleContent>
//                     <Separator />
//                     <div className="p-3 space-y-2">
//                       {run.nodeResults && run.nodeResults.length > 0 ? (
//                         run.nodeResults.map((result: any, index: number) => (
//                           <div 
//                             key={index}
//                             className="text-xs p-2 bg-gray-50 rounded border border-gray-100"
//                           >
//                             <div className="flex items-center gap-2 mb-1">
//                               {result.status === 'success' ? (
//                                 <CheckCircle2 className="h-3 w-3 text-green-500" />
//                               ) : (
//                                 <XCircle className="h-3 w-3 text-red-500" />
//                               )}
//                               <span className="font-medium">{result.nodeId}</span>
//                               <span className="text-gray-400">
//                                 {(result.duration / 1000).toFixed(2)}s
//                               </span>
//                             </div>
//                             {result.error && (
//                               <p className="text-red-600 text-xs mt-1">
//                                 Error: {result.error}
//                               </p>
//                             )}
//                           </div>
//                         ))
//                       ) : (
//                         <p className="text-xs text-gray-400">No execution details</p>
//                       )}
//                     </div>
//                   </CollapsibleContent>
//                 </div>
//               </Collapsible>
//             ))}
//           </div>
//         )}
//       </ScrollArea>
//     </div>
//   );
// }



// 'use client';

// import { useState, useEffect } from 'react';
// import { formatDistanceToNow } from 'date-fns';
// import { 
//   ChevronRight, 
//   ChevronLeft,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Loader2,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';

// interface Props {
//   workflowId: string;
// }

// export default function RightSidebar({ workflowId }: Props) {
//   const [collapsed, setCollapsed] = useState(false);
//   const [runs, setRuns] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchRuns();
//     const interval = setInterval(fetchRuns, 5000);
//     return () => clearInterval(interval);
//   }, [workflowId]);

//   const fetchRuns = async () => {
//     try {
//       const response = await fetch(`/api/workflows/${workflowId}`);
//       if (!response.ok) return;
//       const data = await response.json();
//       setRuns(data.workflow?.workflowRuns || []);
//     } catch (error) {
//       console.error('Failed to fetch runs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'RUNNING':
//         return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
//       case 'SUCCESS':
//         return <CheckCircle2 className="h-4 w-4 text-green-500" />;
//       case 'FAILED':
//         return <XCircle className="h-4 w-4 text-red-500" />;
//       default:
//         return <Clock className="h-4 w-4 text-gray-400" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'RUNNING':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'SUCCESS':
//         return 'bg-green-100 text-green-800';
//       case 'FAILED':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (collapsed) {
//     return (
//       <div className="w-12 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => setCollapsed(false)}
//         >
//           <ChevronLeft className="h-4 w-4" />
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
//       <div className="p-4 border-b border-gray-200">
//         <div className="flex items-center justify-between">
//           <h2 className="font-semibold text-sm">Workflow History</h2>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setCollapsed(true)}
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       <ScrollArea className="flex-1">
//         {loading ? (
//           <div className="flex items-center justify-center p-8">
//             <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
//           </div>
//         ) : runs.length === 0 ? (
//           <div className="p-8 text-center">
//             <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//             <p className="text-sm text-gray-500">No runs yet</p>
//           </div>
//         ) : (
//           <div className="p-3 space-y-2">
//             {runs.map((run: any) => (
//               <div key={run.id} className="bg-white rounded-lg border border-gray-200 p-3">
//                 <div className="flex items-start gap-3">
//                   {getStatusIcon(run.status)}
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-sm font-medium">
//                         Run #{run.id.slice(-6)}
//                       </span>
//                       <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(run.status)}`}>
//                         {run.status}
//                       </span>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
//                     </p>
//                     <p className="text-xs text-gray-400 mt-1">
//                       {run.scope === 'FULL' ? 'Full Workflow' : 
//                        run.scope === 'PARTIAL' ? 'Selected Nodes' : 
//                        'Single Node'}
//                     </p>
//                     {run.duration && (
//                       <p className="text-xs text-gray-400">
//                         Duration: {(run.duration / 1000).toFixed(2)}s
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </ScrollArea>
//     </div>
//   );
// }






// 'use client';

// import { useState, useEffect } from 'react';
// import { formatDistanceToNow } from 'date-fns';
// import { 
//   ChevronRight, 
//   ChevronLeft,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Loader2,
//   ChevronDown,
//   ChevronUp,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// interface Props {
//   workflowId: string;
// }

// export default function RightSidebar({ workflowId }: Props) {
//   const [collapsed, setCollapsed] = useState(false);
//   const [runs, setRuns] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());

//   useEffect(() => {
//     fetchRuns();
//     const interval = setInterval(fetchRuns, 5000);
//     return () => clearInterval(interval);
//   }, [workflowId]);

//   const fetchRuns = async () => {
//     try {
//       const response = await fetch(`/api/workflows/${workflowId}`);
//       if (!response.ok) return;
//       const data = await response.json();
//       setRuns(data.workflow?.workflowRuns || []);
//     } catch (error) {
//       console.error('Failed to fetch runs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleRunExpanded = (runId: string) => {
//     const newExpanded = new Set(expandedRuns);
//     if (newExpanded.has(runId)) {
//       newExpanded.delete(runId);
//     } else {
//       newExpanded.add(runId);
//     }
//     setExpandedRuns(newExpanded);
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'RUNNING':
//         return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
//       case 'SUCCESS':
//         return <CheckCircle2 className="h-4 w-4 text-green-500" />;
//       case 'FAILED':
//         return <XCircle className="h-4 w-4 text-red-500" />;
//       default:
//         return <Clock className="h-4 w-4 text-gray-400" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'RUNNING':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'SUCCESS':
//         return 'bg-green-100 text-green-800';
//       case 'FAILED':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (collapsed) {
//     return (
//       <div className="w-12 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => setCollapsed(false)}
//         >
//           <ChevronLeft className="h-4 w-4" />
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
//       <div className="p-4 border-b border-gray-200">
//         <div className="flex items-center justify-between">
//           <h2 className="font-semibold text-sm">Workflow History</h2>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setCollapsed(true)}
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       <ScrollArea className="flex-1">
//         {loading ? (
//           <div className="flex items-center justify-center p-8">
//             <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
//           </div>
//         ) : runs.length === 0 ? (
//           <div className="p-8 text-center">
//             <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//             <p className="text-sm text-gray-500">No runs yet</p>
//           </div>
//         ) : (
//           <div className="p-3 space-y-2">
//             {runs.map((run: any) => {
//               const nodeResults = Array.isArray(run.nodeResults) 
//                 ? run.nodeResults 
//                 : (typeof run.nodeResults === 'string' && run.nodeResults !== '[]')
//                   ? JSON.parse(run.nodeResults)
//                   : [];
              
//               const isExpanded = expandedRuns.has(run.id);

//               return (
//                 <div key={run.id} className="bg-white rounded-lg border border-gray-200 p-3">
//                   <div className="flex items-start gap-3">
//                     {getStatusIcon(run.status)}
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className="text-sm font-medium">
//                           Run #{run.id.slice(-6)}
//                         </span>
//                         <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(run.status)}`}>
//                           {run.status}
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-500">
//                         {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
//                       </p>
//                       <p className="text-xs text-gray-400 mt-1">
//                         {run.scope === 'FULL' ? 'Full Workflow' : 
//                          run.scope === 'PARTIAL' ? 'Selected Nodes' : 
//                          'Single Node'}
//                       </p>
//                       {run.duration && (
//                         <p className="text-xs text-gray-400">
//                           Duration: {(run.duration / 1000).toFixed(2)}s
//                         </p>
//                       )}

//                       {nodeResults.length > 0 && (
//                         <Collapsible open={isExpanded} onOpenChange={() => toggleRunExpanded(run.id)}>
//                           <CollapsibleTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               className="w-full justify-between mt-2 h-7 text-xs"
//                             >
//                               <span>{nodeResults.length} node(s) executed</span>
//                               {isExpanded ? (
//                                 <ChevronUp className="h-3 w-3" />
//                               ) : (
//                                 <ChevronDown className="h-3 w-3" />
//                               )}
//                             </Button>
//                           </CollapsibleTrigger>
//                           <CollapsibleContent className="mt-2 space-y-2">
//                             {nodeResults.map((result: any, idx: number) => (
//                               <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
//                                 <div className="flex items-center justify-between mb-1">
//                                   <span className="font-medium text-gray-700">
//                                     {result.nodeType || 'Node'}
//                                   </span>
//                                   <span className={`px-1.5 py-0.5 rounded text-xs ${
//                                     result.status === 'success' 
//                                       ? 'bg-green-100 text-green-700' 
//                                       : 'bg-red-100 text-red-700'
//                                   }`}>
//                                     {result.status}
//                                   </span>
//                                 </div>
//                                 {result.output && (
//                                   <div className="mt-1">
//                                     {result.output.text && (
//                                       <p className="text-gray-600 truncate">
//                                         Text: {result.output.text}
//                                       </p>
//                                     )}
//                                     {result.output.response && (
//                                       <p className="text-gray-600 max-h-20 overflow-y-auto text-xs">
//                                         LLM: {result.output.response}
//                                       </p>
//                                     )}
//                                     {result.output.imageUrl && (
//                                       <p className="text-gray-600 truncate">
//                                         Image: {result.output.imageUrl}
//                                       </p>
//                                     )}
//                                   </div>
//                                 )}
//                                 {result.error && (
//                                   <p className="text-red-600 text-xs mt-1">
//                                     Error: {result.error}
//                                   </p>
//                                 )}
//                               </div>
//                             ))}
//                           </CollapsibleContent>
//                         </Collapsible>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </ScrollArea>
//     </div>
//   );
// }







'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Props {
  workflowId: string;
}

/**
 * Normalize nodeResults into an array safely.
 * Handles:
 * - array
 * - object keyed by nodeId (MOST COMMON)
 * - stringified JSON
 */
function normalizeNodeResults(nodeResults: any): any[] {
  if (!nodeResults) return [];

  if (Array.isArray(nodeResults)) {
    return nodeResults;
  }

  if (typeof nodeResults === 'object') {
    return Object.values(nodeResults);
  }

  if (typeof nodeResults === 'string') {
    try {
      const parsed = JSON.parse(nodeResults);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object') return Object.values(parsed);
    } catch {
      return [];
    }
  }

  return [];
}

export default function RightSidebar({ workflowId }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  }, [workflowId]);

  const fetchRuns = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) return;
      const data = await response.json();
      setRuns(data.workflow?.workflowRuns || []);
    } catch (error) {
      console.error('Failed to fetch runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRunExpanded = (runId: string) => {
    setExpandedRuns((prev) => {
      const next = new Set(prev);
      next.has(runId) ? next.delete(runId) : next.add(runId);
      return next;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-4">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Workflow History</h2>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : runs.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No runs yet</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {runs.map((run: any) => {
              const nodeResults = normalizeNodeResults(run.nodeResults);
              const isExpanded = expandedRuns.has(run.id);

              return (
                <div
                  key={run.id}
                  className="bg-white rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(run.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          Run #{run.id.slice(-6)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                            run.status
                          )}`}
                        >
                          {run.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(run.startedAt), {
                          addSuffix: true,
                        })}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {run.scope === 'FULL'
                          ? 'Full Workflow'
                          : run.scope === 'PARTIAL'
                          ? 'Selected Nodes'
                          : 'Single Node'}
                      </p>

                      {run.duration && (
                        <p className="text-xs text-gray-400">
                          Duration: {(run.duration / 1000).toFixed(2)}s
                        </p>
                      )}

                      {nodeResults.length > 0 && (
                        <Collapsible
                          open={isExpanded}
                          onOpenChange={() => toggleRunExpanded(run.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between mt-2 h-7 text-xs"
                            >
                              <span>
                                {nodeResults.length} node(s) executed
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </Button>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="mt-2 space-y-2">
                            {nodeResults.map((result: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-gray-50 rounded p-2 text-xs"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-700">
                                    {result.nodeType || 'Node'}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-xs ${
                                      result.status
                                        ?.toLowerCase() === 'success'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {result.status}
                                  </span>
                                </div>

                                {result.output && (
                                  <div className="mt-1 space-y-1">
                                    {result.output.text && (
                                      <p className="text-gray-600 truncate">
                                        Text: {result.output.text}
                                      </p>
                                    )}
                                    {result.output.response && (
                                      <p className="text-gray-600 max-h-20 overflow-y-auto">
                                        LLM: {result.output.response}
                                      </p>
                                    )}
                                    {result.output.imageUrl && (
                                      <p className="text-gray-600 truncate">
                                        Image: {result.output.imageUrl}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {result.error && (
                                  <p className="text-red-600 text-xs mt-1">
                                    Error: {result.error}
                                  </p>
                                )}
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
