"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Register() {
  const { user, isLoading, registerUser } = useAuth()
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (user) {
      try {
        await registerUser(username, avatar)
        router.push('/')
      } catch (err) {
        setError('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.')
        console.error(err)
      }
    }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Finalisez votre profil</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="avatar">URL de l'avatar</Label>
            <Input
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatar} alt="Avatar preview" />
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full">Enregistrer le profil</Button>
        </form>
      </div>
    </div>
  )
}

