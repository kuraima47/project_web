"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, ArrowLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

// Exemple de données pour la démonstration
const sampleUsers = [
  { id: '1', username: "alice", avatar: "/placeholder.svg?height=40&width=40" },
  { id: '2', username: "bob", avatar: "/placeholder.svg?height=40&width=40" },
  { id: '3', username: "charlie", avatar: "/placeholder.svg?height=40&width=40" },
  { id: '4', username: "david", avatar: "/placeholder.svg?height=40&width=40" },
]

const sampleMessages = {
  '1': [
    { id: '1', sender: 'alice', content: 'Salut ! Comment ça va ?', timestamp: '10:00' },
    { id: '2', sender: 'currentUser', content: 'Ça va bien, merci ! Et toi ?', timestamp: '10:05' },
    { id: '3', sender: 'alice', content: 'Très bien ! Tu as vu les dernières news sur la blockchain ?', timestamp: '10:10' },
  ],
  '4': [
    { id: '1', sender: 'david', content: 'Hey ! Tu es dispo pour un call ?', timestamp: '11:00' },
    { id: '2', sender: 'currentUser', content: 'Oui, dans 30 minutes ça te va ?', timestamp: '11:15' },
    { id: '3', sender: 'david', content: 'Parfait, à tout à l\'heure !', timestamp: '11:20' },
  ],
}

export default function Conversation() {
  const params = useParams()
  const router = useRouter()
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState(sampleMessages[params.id as string] || [])
  const [user, setUser] = useState(sampleUsers.find(u => u.id === params.id))

  useEffect(() => {
    if (!user) {
      router.push('/messages')
    }
  }, [user, router])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now().toString(),
        sender: 'currentUser',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, newMsg])
      setNewMessage('')
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.push('/messages')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Avatar className="mr-2">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold">Conversation avec {user.username}</h2>
      </div>
      <ScrollArea className="flex-grow mb-4 p-4 border rounded-lg">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'currentUser' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-2 rounded-lg ${
                message.sender === 'currentUser' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <p>{message.content}</p>
                <p className="text-xs text-right mt-1">{message.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Input 
          placeholder="Écrivez votre message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

