import './globals.css'
import { PostHogProvider, ThemeProvider } from './providers'
import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'
import { Inter, VT323 } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const vt323 = VT323({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
})

export const metadata: Metadata = {
  title: 'DaVinci AI',
  description: 'Free and Open-source version of Anthropic\'s Artifacts',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <PostHogProvider>
        <body className={`${inter.className} ${vt323.variable}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </body>
      </PostHogProvider>
    </html>
  )
}
