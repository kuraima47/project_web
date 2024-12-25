import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Repeat2 } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime } from "@/lib/utils"
import { CommentModal } from './comment-modal'

interface Comment {
  id: string
  content: string
  user: {
    username: string
    avatar: string
  }
}

interface Hashtag {
  name: string
}

interface PostCardProps {
  id: string
  content: string
  createdAt: string
  likes: number
  Comments: Comment[]
  Hashtags: Hashtag[]
  reposts: number
  media?: string
  author: {
    id: number
    username: string
    avatar: string
    address: string
  }
  originalPostId?: number
  onUpdate: () => void
}

export function PostCard({ id, content, createdAt, likes: initialLikes, Comments: initialComments, Hashtags, reposts: initialReposts, media, author, originalPostId, onUpdate }: PostCardProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [commentCount, setCommentCount] = useState(initialComments?.length || 0)
  const [reposts, setReposts] = useState(initialReposts)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const relativeTime = formatRelativeTime(new Date(createdAt))
  console.log("comments Count :", commentCount)
  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setLikes(data.likes)
        onUpdate()
      } else {
        throw new Error('Failed to like post')
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleComment = () => {
    setIsCommentModalOpen(true)
  }

  const handleCommentSubmit = async (content: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      })
      if (response.ok) {
        setCommentCount(prevCount => prevCount + 1)
        onUpdate()
      } else {
        throw new Error('Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleRepost = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${id}/repost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setReposts(data.reposts)
        onUpdate()
      } else {
        throw new Error('Failed to repost')
      }
    } catch (error) {
      console.error('Error reposting:', error)
    }
  }

  return (
      <Card className="mb-4">
        <Link href={`/posts/${id}`}>
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <Avatar>
              <AvatarImage src={author.avatar} alt={author.username} />
              <AvatarFallback>{author.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{author.username}</p>
              <p className="text-sm text-muted-foreground">{relativeTime}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p>{content}</p>
            {Hashtags && Hashtags.length > 0 && (
                <div className="mt-2">
                  {Hashtags.map((hashtag, index) => (
                      <span key={index} className="text-blue-500 mr-2">#{hashtag.name}</span>
                  ))}
                </div>
            )}
            {media && (
                <div className="mt-2">
                  {media.endsWith('.mp4') ? (
                      <video src={media} controls className="w-full rounded-lg" />
                  ) : (
                      <img src={media} alt="Post media" className="w-full rounded-lg" />
                  )}
                </div>
            )}
          </CardContent>
        </Link>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={handleLike}>
            <Heart className="mr-2 h-4 w-4" />
            {likes}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleComment}>
            <MessageCircle className="mr-2 h-4 w-4" />
            {commentCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRepost}>
            <Repeat2 className="mr-2 h-4 w-4" />
            {reposts}
          </Button>
        </CardFooter>
        <CommentModal
            isOpen={isCommentModalOpen}
            onClose={() => setIsCommentModalOpen(false)}
            onSubmit={handleCommentSubmit}
        />
      </Card>
  )
}

