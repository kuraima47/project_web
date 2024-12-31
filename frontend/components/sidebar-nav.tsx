"use client"

import { Home, Search, MessageSquare, Bell, User, Settings, Swords, Bitcoin } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

export function SidebarNav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/search', icon: Search, label: 'Recherche' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/anarchie', icon: Swords, label: 'Anarchie' },
    { href: user ? `/users/${user.address}` : '/login', icon: User, label: 'Mon Profil' },
    { href: '/cryptos', icon: Bitcoin, label: 'Cryptos' },
    { href: '/settings', icon: Settings, label: 'Paramètres' },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
      <div className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-background border-r border-border">
        <div className="p-4">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="flex gap-0.5">
            <span className="block w-2 h-2 bg-foreground"></span>
            <span className="block w-2 h-2 bg-foreground"></span>
          </span>
            BlockTweet
          </h1>
        </div>
        <nav className="flex-1 px-2">
          {navItems.map((item) => (
              <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                      "flex items-center gap-4 px-4 py-3 text-lg rounded-lg transition-colors w-full text-left",
                      pathname === item.href
                          ? "text-foreground bg-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </button>
          ))}
        </nav>
      </div>
  )
}

