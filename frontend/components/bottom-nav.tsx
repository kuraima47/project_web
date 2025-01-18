"use client"

import { Home, Search, MessageSquare, Bell, User, Swords,Flame, Bitcoin, LogInIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useNotification } from "@/contexts/notification-context";

export function BottomNav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
    const { unreadCount } = useNotification();

  let navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/search', icon: Search, label: 'Recherche' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    {
      href: "/notifications",
      icon: Bell,
      label: "Notifications",
      badge: unreadCount,
    },
    { href: '/anarchie', icon: Flame, label: 'Anarchie' },
    { href: "/pixelWar", icon: Swords, label: "Pixel War" },
    { href: '/cryptos', icon: Bitcoin, label: 'Cryptos' },
    { href: user ? `/users/${user.address}` : '/login', icon: User, label: 'Profil' },
  ]

  if(!user) {
    navItems = [{ href: '/login', icon: LogInIcon, label: 'Connexion' }]
  }
  
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
              {item.badge > 0 && (
                <div className="relative">
                  {/* Badge pour l'icône */}
                  <div className="absolute -top-8 -right-6 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-[10px]">
                    
                    {item.badge > 20 && (
                      <p>20+</p>
                    )}

                    {item.badge < 21 && (
                      <p>{item.badge}</p>
                    )}
                  </div>
                </div>
              )}
              <span className="text-xs">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

