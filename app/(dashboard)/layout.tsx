import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Workflow } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with dark theme */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/workflows" className="flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Weavy</span>
          </Link>
          <div className="flex-1" />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}