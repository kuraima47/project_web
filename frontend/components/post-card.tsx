import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Repeat2 } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime } from "@/lib/utils"
import { CommentModal } from './comment-modal'
import { getApiUrl } from "@/utils/address";

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
  const [liked, setLiked] = useState(false)
  const [commentCount, setCommentCount] = useState(initialComments?.length || 0)
  const [reposts, setReposts] = useState(initialReposts)
  const [isReposted, setIsReposted] = useState(false) // État pour la gestion de repost
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const relativeTime = formatRelativeTime(new Date(createdAt))

  useEffect(() => {
    initLikeRepostComment();
  })

  const initLikeRepostComment = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/posts/infos/${id}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setLiked(data.isLiked)
        setIsReposted(data.isReposted != null)
      } else {
        throw new Error('Failed to like post')
      }
    } catch(error) {
      console.error('Error fetch infos', error)
    }
  }


  const handleLike = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/posts/${id}/like`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLikes(data.likes)
        setLiked(data.liked)
        onUpdate()
      } else {
        throw new Error('Failed to like post')
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleRepost = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/posts/${id}/repost`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setReposts(data.reposts)
        setIsReposted(data.isReposted) // Mettre à jour l'état en fonction de la réponse du backend
        onUpdate()
      } else {
        throw new Error('Failed to repost')
      }
    } catch (error) {
      console.error('Error reposting:', error)
    }
  }

  const handleComment = () => {
    setIsCommentModalOpen(true)
  }

  const handleCommentSubmit = async (content: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/posts/${id}/comment`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      })
      if (response.ok) {
        
        const data = await response.json()
        console.log(data);
        setCommentCount(data.responses.length+1)
        onUpdate()
      } else {
        throw new Error('Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  return (
    <Card className="mb-4" id={`${id}`}>
      <Link href={`/posts/${id}`}>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <Link href={`/users/${author.address}`}>
            <Avatar className="hover:cursor-pointer hover:bg-blue-100 hover:ring-2 hover:ring-blue-300 transition-all duration-500">
              <AvatarImage src={author.avatar} alt={author.username} />
              <AvatarFallback>{author.username[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <p className="font-semibold">{author.username}</p>
            <p className="text-sm text-muted-foreground">{relativeTime}</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="break-words">{content}</p>
          {Hashtags && Hashtags.length > 0 && (
            <div className="mt-2">
              {Hashtags.map((hashtag, index) => (
                <span key={index} className="text-blue-500 mr-2">#{hashtag.name}</span>
              ))}
            </div>
          )}
          {media && (
            <div className="mt-2 flex items-center justify-center">
              {media.endsWith('.mp4') ? (
                <video src={media} controls className="w-full rounded-lg" />
              ) : (
                <img
                  src={`${getApiUrl(`/api/posts/media/${media}`)}`}
                  alt="Post media"
                  className="max-w-[512px] max-h-[128px] rounded-lg object-contain"
                />
              )}
            </div>
          )}
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={handleLike}>
          <Heart
            className={`mr-2 h-4 w-4 transition-colors duration-300 ${
              liked ? 'text-red-500' : 'text-muted-foreground'
            }`}
          />
          {likes}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleComment}>
          <MessageCircle className="mr-2 h-4 w-4" />
          {commentCount}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRepost}>
          <Repeat2
            className={`mr-2 h-4 w-4 transition-colors duration-300 ${
              isReposted ? 'text-green-500' : 'text-muted-foreground'
            }`}
          />
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
