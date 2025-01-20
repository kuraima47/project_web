"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogIn, Mail, Key, Wallet } from 'lucide-react';

export default function Login() {
  const { user, connectWallet, connectWithPassword, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      if (user.username && user.username.substring(0,16) != 'defaultGenerated' ) {
        router.push('/')
      } else {
        router.push('/register')
      }
    }
  }, [user, router])

  const handleConnectMetamask = async () => {
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

  const handlePasswordLogin = async () => {
    try {
        setError(null);
        await connectWithPassword(email, password);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Unknown error occurred during login.');
        }
    }
};

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-sm w-full">
        <h1 className="text-3xl font-bold dark:text-gray-100 text-gray-800 text-center mb-4">Bienvenue sur<span className="text-blue-500"> BlockTwit</span></h1>
        <p className="text-gray-600 dark:text-gray-200 text-center mb-6">Enregistrez vous / Connectez vous avec Metamask / Mail</p>
        
        {/* MetaMask Button */}
        <button
          onClick={connectWallet}
          className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <Wallet className="w-5 h-5" />
          Connexion avec Metamask
        </button>
        
        <div className="my-6 border-t border-gray-300"></div>
        
        {/* Email and Password Login */}
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse Mail"
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <button
            onClick={handlePasswordLogin}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <LogIn className="w-5 h-5" />
            Connexion avec mail
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}

