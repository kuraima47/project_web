"use client"

import { useParams } from 'next/navigation'
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Ceci est un exemple de données. Dans une vraie application, vous récupéreriez ces données depuis votre API.
const initialPostData = {
  id: '1',
  username: "alice",
  avatar: "/placeholder.svg?height=40&width=40",
  content: "Découverte incroyable sur la blockchain aujourd'hui !",
  timestamp: "Il y a 2 heures",
  likes: 15,
  comments: 3,
  reposts: 2,
  topComments: [
    {
      id: '1',
      username: "bob",
      avatar: "/placeholder.svg?height=30&width=30",
      content: "Wow, c'est fascinant !",
      likes: 5
    },
    {
      id: '2',
      username: "charlie",
      avatar: "/placeholder.svg?height=30&width=30",
      content: "Peux-tu nous en dire plus ?",
      likes: 3
    }
  ]
}

export default function PostDetail() {
  const params = useParams()
  const [postData, setPostData] = useState(initialPostData)
  const [newComment, setNewComment] = useState('')

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    const newCommentObj = {
      id: Date.now().toString(),
      username: "currentUser",
      avatar: "/placeholder.svg?height=30&width=30",
      content: newComment,
      likes: 0
    }
    setPostData(prevData => ({
      ...prevData,
      comments: prevData.comments + 1,
      topComments: [newCommentObj, ...prevData.topComments]
    }))
    setNewComment('')
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Détails du post</h2>
      <PostCard {...postData} />
      <form onSubmit={handleSubmitComment} className="mt-4">
        <Input
          type="text"
          placeholder="Ajouter un commentaire..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
        />
        <Button type="submit">Commenter</Button>
      </form>
      <div className="mt-4 space-y-2">
        {postData.topComments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-2 bg-card p-2 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.avatar} alt={comment.username} />
              <AvatarFallback>{comment.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{comment.username}</p>
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

