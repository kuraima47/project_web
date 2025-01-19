"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CreatePost } from "@/components/create-post"
import { PostCard } from "@/components/post-card"
import { getApiUrl } from "@/utils/address";
import {Button} from "@/components/ui/button";

export default function Home() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [posts, setPosts] = useState([])
    const [route, setRoute] = useState("/api/feed/general")

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        } else if (user) {
            fetchPosts()
        }
    }, [user, isLoading, router, route])

    const fetchPosts = async () => {
        try {
            const response = await fetch(getApiUrl("/api/posts"), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                console.log("Fetch Data : ", data)
                setPosts(data)
            } else {
                throw new Error('Failed to fetch posts')
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
        }
    }

    const handleRouteChange = async (route) => {
        setRoute(route)
    }

    if (isLoading || !user) {
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between">
                <h2 className="text-2xl font-semibold mb-6">Fil d'actualité</h2>
                <div className="flex space-x-4">
                    <Button onClick={() => handleRouteChange("/api/posts")} variant="default" size="default">Général</Button>
                    <Button onClick={() => handleRouteChange("/api/feed/general")} variant="default" size="default">Abonnements</Button>
                </div>
            </div>

            <CreatePost onPostCreated={fetchPosts} />
            <div className="space-y-6 mt-6">
                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        id={post.id}
                        content={post.content}
                        createdAt={post.createdAt}
                        likes={post.likes}
                        Comments={post.responses}
                        Hashtags={post.Hashtags}
                        reposts={post.reposts}
                        media={post.media}
                        author={post.author}
                        originalPostId={post.originalPostId}
                        onUpdate={fetchPosts}
                    />
                ))}
            </div>
        </div>
    )
}

