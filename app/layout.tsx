import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider } from '@/contexts/auth-context'
import { BottomNav } from '@/components/bottom-nav'
import { SidebarNav } from '@/components/sidebar-nav'
import { ThemeToggle } from '@/components/theme-toggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BlockTwit',
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
            <div className="flex min-h-screen">
              <SidebarNav />
              <main className="flex-1 md:ml-64">
                <div className="max-w-3xl mx-auto p-4">
                  <div className="flex justify-end mb-4">
                    <ThemeToggle />
                  </div>
                  {children}
                </div>
              </main>
              <BottomNav />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

