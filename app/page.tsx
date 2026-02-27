import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, Zap, Workflow, ArrowRight, Github } from 'lucide-react';
import HeroCanvas from '@/components/workflow/HeroCanvas';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/workflows');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Workflow className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text" >Weavy Clone</span>
            </div>
            <div className="flex gap-3">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by AI</span>
          </div>

          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Visual Workflow Builder
            <br />
            for AI Workflows
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create powerful AI workflows with a simple drag-and-drop interface.
            Connect nodes, run AI models, and automate your creative process.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Start Building
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://github.com/yourusername/weavy-clone" target="_blank">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Workflow Preview Section */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 blur-3xl rounded-full opacity-20 transform -translate-y-1/2" />
          <div className="relative h-[600px] w-full rounded-2xl border border-border/50 bg-[#0a0f1a]/80 shadow-2xl overflow-hidden backdrop-blur-xl ring-1 ring-white/10">
            {/* Browser-like window header */}
            <div className="h-10 w-full border-b border-border/50 bg-black/40 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white/5 px-3 py-1 rounded-md">
                <Workflow className="w-3 h-3" />
                Sample Context: Generative Image Pipeline
              </div>
            </div>

            {/* The actual Canvas */}
            <div className="h-[calc(100%-40px)] w-full">
              <HeroCanvas />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <Workflow className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Visual Editor</h3>
            <p className="text-muted-foreground">
              Drag and drop nodes to build complex workflows. No coding required.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Integration</h3>
            <p className="text-muted-foreground">
              Execute Google Gemini models directly in your workflows with ease.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm card-hover">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Execution</h3>
            <p className="text-muted-foreground">
              Run your workflows and see results instantly with live feedback.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 p-8 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">6+</div>
              <div className="text-sm text-muted-foreground">Node Types</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">Fast</div>
              <div className="text-sm text-muted-foreground">Execution</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">Free</div>
              <div className="text-sm text-muted-foreground">Open Source</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built for Galaxy.ai Internship Assignment</p>
            <p className="mt-2">© 2026 Weavy Clone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}