"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Comment {
    id: string
    content: string
    User: {
        username: string
        avatar: string
    }
}

interface Hashtag {
    name: string
}

interface Post {
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
}

export default function PostDetail() {
    const { id } = useParams()
    const [post, setPost] = useState<Post | null>(null)
    const [comment, setComment] = useState('')
    const { user } = useAuth()

    useEffect(() => {
        fetchPost()
    }, [id])

    const fetchPost = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setPost(data)
            } else {
                throw new Error('Failed to fetch post')
            }
        } catch (error) {
            console.error('Error fetching post:', error)
        }
    }

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch(`http://localhost:3001/api/posts/${id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content: comment })
            })
            if (response.ok) {
                const newComment = await response.json()
                setPost(prevPost => ({
                    ...prevPost!,
                    Comments: [newComment, ...prevPost!.Comments]
                }))
                setComment('')
            } else {
                throw new Error('Failed to add comment')
            }
        } catch (error) {
            console.error('Error adding comment:', error)
        }
    }

    if (!post) {
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PostCard
                id={post.id}
                content={post.content}
                createdAt={post.createdAt}
                likes={post.likes}
                Comments={post.Comments}
                Hashtags={post.Hashtags}
                reposts={post.reposts}
                media={post.media}
                author={post.author}
                originalPostId={post.originalPostId}
                onUpdate={fetchPost}
            />
            <form onSubmit={handleComment} className="mt-4">
                <Input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mb-2"
                />
                <Button type="submit">Comment</Button>
            </form>
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Comments</h3>
                {post.Comments && post.Comments.map((comment) => (
                    <div key={comment.id} className="bg-card p-2 rounded mb-2">
                        <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={comment.User.avatar} alt={comment.User.username} />
                                <AvatarFallback>{comment.User.username[0]}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold">{comment.User.username}</p>
                        </div>
                        <p>{comment.content}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

