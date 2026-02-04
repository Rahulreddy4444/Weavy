'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Workflow, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWorkflow.name.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkflow.name,
          description: newWorkflow.description,
          nodes: [],
          edges: [],
        }),
      });

      if (!response.ok) throw new Error('Creation failed');

      const data = await response.json();
      toast.success('Workflow created');
      router.push(`/workflows/${data.workflow.id}`);
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create workflow');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete workflow "${name}"?`)) return;

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Workflow deleted');
      loadWorkflows();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete workflow');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
            <p className="text-gray-500 mt-1">
              Create and manage your AI workflows
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Workflow</DialogTitle>
                  <DialogDescription>
                    Create a new workflow to get started
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newWorkflow.name}
                      onChange={(e) =>
                        setNewWorkflow({ ...newWorkflow, name: e.target.value })
                      }
                      placeholder="My Workflow"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newWorkflow.description}
                      onChange={(e) =>
                        setNewWorkflow({
                          ...newWorkflow,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your workflow..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Workflows Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : workflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Workflow className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No workflows yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first workflow
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/workflows/${workflow.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{workflow.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(workflow.id, workflow.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </CardTitle>
                  {workflow.description && (
                    <CardDescription className="line-clamp-2">
                      {workflow.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      {workflow.nodes?.length || 0} nodes,{' '}
                      {workflow.edges?.length || 0} connections
                    </p>
                    <p>{workflow._count.workflowRuns} runs</p>
                    <p>
                      Updated{' '}
                      {formatDistanceToNow(new Date(workflow.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}







// 'use client';

// export default function WorkflowsPage() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <h1 className="text-3xl font-bold">Workflows</h1>
//         <p className="text-gray-500 mt-2">
//           Create and manage your AI workflows
//         </p>
        
//         <div className="mt-8 bg-white rounded-lg shadow p-12 text-center">
//           <h3 className="text-lg font-medium mb-2">
//             Welcome! 🎉
//           </h3>
//           <p className="text-gray-500">
//             Authentication is working! We'll build the workflow builder next.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }