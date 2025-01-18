"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/contexts/auth-context'
import { ArrowLeft } from 'lucide-react'
import { getApiUrl } from "@/utils/address";

interface Post {
    id: string
    content: string
    createdAt: string
    likes: number
    responses: Post[]  // Réponses (posts enfants) d'un post
    Hashtags: { name: string }[] 
    reposts: number
    media?: string
    author: {
        id: number
        username: string
        avatar: string
        address: string
    }
    parentPostId?: string | null  // ID du post parent
}

export default function PostDetail() {
    const { id } = useParams()
    const [post, setPost] = useState<Post | null>(null)
    const [postHistory, setPostHistory] = useState<Post[]>([]) 
    const { user } = useAuth()

    // Charger un post et ses réponses
    useEffect(() => {
        fetchPost()
    }, [id])

    const fetchPost = async () => {
        try {
            const response = await fetch(getApiUrl(`/api/posts/${id}`), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setPost(data)
                // Charger l'historique des posts parents
                await fetchPostHistory(data)
            } else {
                throw new Error('Failed to fetch post')
            }
        } catch (error) {
            console.error('Error fetching post:', error)
        }
    }

    // Charger l'historique des posts parents jusqu'à la racine
    const fetchPostHistory = async (currentPost: Post) => {
        const history: Post[] = []
        let post = currentPost

        // Remonter l'arbre des posts jusqu'à la racine
        while (post.parentPostId) {
            const response = await fetch(getApiUrl(`/api/posts/${post.parentPostId}`), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Ajoutez ici l'authentification si nécessaire
                }
            })
            if (response.ok) {
                const parentPost = await response.json()
                history.unshift(parentPost)  // Ajouter à l'avant pour garder l'ordre du parent au plus ancien
                post = parentPost
            } else {
                console.error(`Failed to fetch parent post with ID: ${post.parentPostId}`)
                break
            }
        }

        setPostHistory(history)
    }

    // Gérer l'ajout d'une réponse à un post
    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        const content = (e.target as HTMLFormElement).elements.namedItem('content') as HTMLInputElement;
        const replyContent = content.value;

        try {
            const response = await fetch(getApiUrl(`/api/posts/${id}/comment`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content: replyContent })
            })
            if (response.ok) {
                const newPost = await response.json()
                setPost(prevPost => (prevPost ? {
                    ...prevPost,
                    responses: [newPost, ...prevPost.responses] // Ajouter la réponse au post
                } : prevPost))
            } else {
                throw new Error('Failed to add reply')
            }
        } catch (error) {
            console.error('Error adding reply:', error)
        }
    }

    // Fonction pour distinguer les réponses récentes des anciennes
    const isRecent = (createdAt: string): boolean => {
        const postDate = new Date(createdAt);
        const now = new Date();
        const timeDiff = now.getTime() - postDate.getTime();
        const dayInMillis = 24 * 60 * 60 * 1000;
        return timeDiff <= dayInMillis; // Si la réponse a été postée dans les dernières 24 heures
    }

    // Fonction de scroll vers une réponse spécifique
    const scrollToResponse = (responseId: string) => {
        const responseElement = document.getElementById(responseId);
        if (responseElement) {
            responseElement.scrollIntoView({ behavior: "smooth" });
        }
    }

    // Fonction pour faire défiler la page au bas lors du clic sur le lien
    const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth', // Pour un défilement fluide
        });
    };

    // Effet de scroll vers le bas de la page lorsque le composant est monté
    useEffect(() => {
        scrollToBottom(); // Scroll au bas lors du montage du composant
    }, [id]); // Se déclenche lorsque l'ID du post change

    // Affichage du post et de ses réponses
    if (!post) {
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Affichage des posts parents dans l'ordre chronologique */}
            <div className="mb-4">
                {postHistory.map((parentPost) => (
                    <div key={parentPost.id} className="mb-4">
                        <PostCard
                            id={parentPost.id}
                            content={parentPost.content}
                            createdAt={parentPost.createdAt}
                            likes={parentPost.likes}
                            Comments={parentPost.responses} // No comments, we use responses now
                            Hashtags={parentPost.Hashtags}
                            reposts={parentPost.reposts}
                            media={parentPost.media}
                            author={parentPost.author}
                            originalPostId={parentPost.parentPostId}
                            onUpdate={fetchPost}
                        />
                    </div>
                ))}
            </div>

            {/* Affichage du post actuel */}
            <PostCard
                id={post.id}
                content={post.content}
                createdAt={post.createdAt}
                likes={post.likes}
                Comments={post.responses} // No comments, we use responses now
                Hashtags={post.Hashtags}
                reposts={post.reposts}
                media={post.media}
                author={post.author}
                originalPostId={post.parentPostId}
                onUpdate={fetchPost}
            />

            {/* Bouton de retour au parent si ce n'est pas un post racine */}
            {post.parentPostId && (
                <Link href={`/posts/${post.parentPostId}`} className="fixed left-1/3 transform -translate-x-1/2 top-1/2 z-50 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                    <ArrowLeft className="text-lg" />
                </Link>
            )}

            {!post.parentPostId && (
                <Link href={`/#${post.id}`} className="fixed left-1/3 transform -translate-x-1/2 top-1/2 z-50 dark:bg-gray-800 bg-white p-2 rounded-full shadow-lg">
                    <ArrowLeft className="text-lg" />
                </Link>
            )}

            {/* Formulaire pour répondre au post */}
            <form onSubmit={handleReply} className="mt-4 flex items-center gap-4">
                <Input
                    type="text"
                    name="content"
                    placeholder="Ajouter une réponse..."
                    className="flex-1"
                />
                <Button type="submit">Répondre</Button>
            </form>

            {/* Affichage des réponses (posts enfants) */}
            <div className="mt-4">
                {post.responses.length > 0 && (
                    <h3 className="text-lg font-semibold mb-2">Réponses</h3>
                )}
                <div className="space-y-4">
                    {post.responses.map((response) => (
                        <div 
                            key={response.id} 
                            id={`response-${response.id}`} // Ajout d'un ID unique pour chaque réponse
                            className={`bg-card p-4 rounded-lg shadow-md ${isRecent(response.createdAt) ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-500'}`}
                            onClick={() => scrollToResponse(response.id)}
                        >
                            <PostCard
                                id={response.id}
                                content={response.content}
                                createdAt={response.createdAt}
                                likes={response.likes}
                                Comments={response.responses} // No comments, we use responses now
                                Hashtags={response.Hashtags}
                                reposts={response.reposts}
                                media={response.media}
                                author={response.author}
                                originalPostId={response.parentPostId}
                                onUpdate={fetchPost}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
