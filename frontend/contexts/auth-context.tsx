"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getApiUrl } from "@/utils/address";

type User = {
    id: number
    address: string
    username: string
    avatar: string
    bio: string
}

type AuthContextType = {
    user: User | null
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
    isLoading: boolean
    registerUser: (username: string, avatar: string, bio: string) => Promise<void>
    updateUser: (username: string, avatar: string, bio: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            fetchUserProfile(token)
        } else {
            setIsLoading(false)
        }
    }, [])

    const fetchUserProfile = async (token: string) => {
        try {
            const response = await fetch(getApiUrl('/api/users/profile'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                throw new Error('Failed to fetch user profile')
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
            localStorage.removeItem('token')
        } finally {
            setIsLoading(false)
        }
    }

    const connectWallet = async () => {
        if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' })
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                const address = await signer.getAddress()

                const message = `Connexion à BlockTwit: ${Date.now()}`
                const signature = await signer.signMessage(message)

                const response = await fetch(getApiUrl('/api/users/auth'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ address, signature, message })
                })

                if (!response.ok) {
                    throw new Error('Authentication failed')
                }

                const data = await response.json()
                setUser(data.user)
                localStorage.setItem('token', data.token)
               console.log('Connexion réussie avec l\'adresse:', address)
            } catch (error) {
                console.error('Erreur lors de la connexion:', error)
                throw error
            }
        } else {
            console.log('Veuillez installer MetaMask!')
            throw new Error('MetaMask n\'est pas installé')
        }
    }

    const disconnectWallet = () => {
        setUser(null)
        localStorage.removeItem('token')
    }

    const registerUser = async (username: string, avatar: string, bio: string) => {
        if (!user) throw new Error('User not authenticated')

        try {
            const response = await fetch(getApiUrl('/api/users/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ address: user.address, username, avatar, bio })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Registration failed')
            }
        
            const updatedUser = await response.json()
            setUser(updatedUser.user)
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error)
            throw error
        }
    }

    const updateUser = async (username: string, avatar: string, bio: string) => {
        if (!user) throw new Error('User not authenticated')

        try {
            const response = await fetch(getApiUrl('/api/users/update'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ username, avatar, bio })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Update failed')
            }

            const updatedUser = await response.json()
            setUser(updatedUser.user)
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{ user, connectWallet, disconnectWallet, isLoading, registerUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
    }
    return context
}

