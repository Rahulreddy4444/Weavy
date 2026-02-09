'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to create workflow');

      const { workflow } = await response.json();
      toast.success('Workflow created successfully');
      router.push(`/workflows/${workflow.id}`);
    } catch (error) {
      toast.error('Failed to create workflow');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/workflows">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workflows
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create New Workflow</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new AI workflow to get started
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-foreground">
                Workflow Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Workflow"
                className="mt-2 bg-background border-border text-foreground"
                disabled={loading}
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground">
                Description
                <span className="text-muted-foreground ml-1">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                className="mt-2 min-h-[100px] bg-background border-border text-foreground resize-none"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Workflow
                  </>
                )}
              </Button>
              <Link href="/workflows" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="w-full border-border"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}