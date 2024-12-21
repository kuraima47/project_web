"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageSquare, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'

// Exemple de données pour la démonstration
const sampleUsers = [
  { id: '1', username: "alice", avatar: "/placeholder.svg?height=40&width=40", isFollowing: true, isFollower: true },
  { id: '2', username: "bob", avatar: "/placeholder.svg?height=40&width=40", isFollowing: true, isFollower: false },
  { id: '3', username: "charlie", avatar: "/placeholder.svg?height=40&width=40", isFollowing: false, isFollower: true },
  { id: '4', username: "david", avatar: "/placeholder.svg?height=40&width=40", isFollowing: true, isFollower: true },
]

export default function Messages() {
  const [conversations, setConversations] = useState(sampleUsers.filter(user => user.isFollowing && user.isFollower))
  const [pendingRequests, setPendingRequests] = useState(sampleUsers.filter(user => user.isFollowing && !user.isFollower))
  const [newMessageUser, setNewMessageUser] = useState('')

  const handleNewConversation = () => {
    const user = sampleUsers.find(u => u.username.toLowerCase() === newMessageUser.toLowerCase())
    if (user) {
      if (user.isFollower) {
        setConversations(prev => [...prev, user])
      } else if (user.isFollowing) {
        setPendingRequests(prev => [...prev, user])
      }
      setNewMessageUser('')
    }
  }

  const handleAcceptRequest = (userId: string) => {
    const user = pendingRequests.find(u => u.id === userId)
    if (user) {
      setConversations(prev => [...prev, user])
      setPendingRequests(prev => prev.filter(u => u.id !== userId))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Messages</h2>
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <Link href={`/messages/${conversation.id}`} key={conversation.id}>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={conversation.avatar} alt={conversation.username} />
                  <AvatarFallback>{conversation.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{conversation.username}</h3>
                  <p className="text-sm text-muted-foreground">Cliquez pour voir la conversation</p>
                </div>
                <MessageSquare className="text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {pendingRequests.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Demandes de message en attente</h3>
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4 flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={request.avatar} alt={request.username} />
                    <AvatarFallback>{request.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{request.username}</h3>
                    <p className="text-sm text-muted-foreground">Souhaite vous envoyer un message</p>
                  </div>
                  <Button onClick={() => handleAcceptRequest(request.id)}>Accepter</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Nouvelle conversation</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input 
              placeholder="Nom d'utilisateur" 
              value={newMessageUser}
              onChange={(e) => setNewMessageUser(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleNewConversation}>
              <UserPlus className="mr-2 h-4 w-4" />
              Démarrer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

