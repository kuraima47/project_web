"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Login() {
  const { user, connectWallet, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.username) {
        router.push('/')
      } else {
        router.push('/register')
      }
    }
  }, [user, router])

  const handleConnect = async () => {
    try {
      setError(null)
      await connectWallet()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Une erreur inconnue s\'est produite lors de la connexion.')
      }
      console.error(err)
    }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Bienvenue sur BlockTwit</h1>
        <p className="mb-6">Connectez-vous avec MetaMask pour commencer</p>
        <Button onClick={handleConnect}>
          Connecter avec MetaMask
        </Button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  )
}

