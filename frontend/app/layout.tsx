import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider } from '@/contexts/auth-context'
import { LayoutWithAuth } from "@/app/layoutWithAuth"
import { QuestProvider } from '@/contexts/QuestContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BlockTweet',
  description: 'Un réseau social décentralisé inspiré de Twitter, utilisant la blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <QuestProvider>
              <LayoutWithAuth>{children}</LayoutWithAuth>
            </QuestProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}