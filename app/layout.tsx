import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Weavy Clone - AI Workflow Builder',
  description: 'Create powerful AI workflows with a simple drag-and-drop interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-background text-foreground antialiased`}>
          {children}
          <Toaster
            position="top-right"
            richColors
            theme="dark"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}