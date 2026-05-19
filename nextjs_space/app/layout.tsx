import { Inter, Caveat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { DemoUserProvider } from '@/components/providers/demo-user-provider'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-handwritten' })

export const metadata: Metadata = {
  title: 'Hearth · Your cozy life planner',
  description: 'A warm, gentle place to plan your days, track your goals, and reflect on your journey. Hearth is your trusted, cozy life planner.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: {
    title: 'Hearth · Your cozy life planner',
    description: 'A warm, gentle place to plan your days and reflect on your journey.',
    images: ['/og-image.png'],
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async></script>
      </head>
      <body className={`${inter.variable} ${caveat.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <DemoUserProvider>
            {children}
          </DemoUserProvider>
          <Toaster />
          <ChunkLoadErrorHandler />
        </ThemeProvider>
      </body>
    </html>
  )
}
