// import { ClerkProvider } from '@clerk/nextjs'
// import './globals.css'
// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import { ToastProvider } from '@/components/providers/ToastProvider'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'Weavy Clone - Workflow Builder',
//   description: 'Visual workflow builder for LLM workflows',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <ClerkProvider>
//       <html lang="en">
//         <body className={inter.className}>
//           {children}
//           <ToastProvider />
//           </body>
//       </html>
//     </ClerkProvider>
//   )
// }


import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Weavy Clone - Workflow Builder',
  description: 'Visual workflow builder for LLM workflows',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}