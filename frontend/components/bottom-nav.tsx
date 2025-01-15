"use client"

import { Home, Search, MessageSquare, Bell, User, Swords, Bitcoin } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export function BottomNav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/search', icon: Search, label: 'Recherche' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/anarchie', icon: Swords, label: 'Anarchie' },
    { href: '/cryptos', icon: Bitcoin, label: 'Cryptos' },
    { href: user ? `/users/${user.address}` : '/login', icon: User, label: 'Profil' },
  ]
  
  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <ul className="flex justify-around">
        {navItems.map((item) => (
          <li key={item.href}>
            <button
              onClick={() => handleNavigation(item.href)}
              className={`flex flex-col items-center p-2 ${
                pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

