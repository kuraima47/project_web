"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { disconnectWallet } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleDisconnect = () => {
    disconnectWallet()
    router.push('/login')
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="dark-mode">Mode sombre</Label>
              <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="notifications">Notifications</Label>
              <Switch id="notifications" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDisconnect}>
              Déconnexion
            </Button>
          </CardContent>
        </Card>
      </div>
  )
}

