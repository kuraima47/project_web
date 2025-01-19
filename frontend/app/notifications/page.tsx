"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Heart, MessageCircle, Repeat2, UserPlus, UserMinus } from 'lucide-react'
import { getApiUrl } from "@/utils/address";
import Link from 'next/link'

interface Notification {
    id: string
    type: 'like' | 'comment' | 'repost' | 'follow' | 'unfollow'
    actor: {
        username: string
        avatar: string
        address: string
    }
    post: {
        id: string
        content: string
    } | null // Le post peut être null dans le cas d'un follow
    comment: {
        content: string
    } | null // Le commentaire peut être null dans le cas d'un follow
    createdAt: string
    read: boolean
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        fetchNotifications()
        markAllAsRead()
    }, [])

    const fetchNotifications = async () => {
        try {
            const response = await fetch(getApiUrl('/api/notifications'), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setNotifications(data)
            } else {
                throw new Error('Failed to fetch notifications')
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            const response = await fetch(getApiUrl(`/api/notifications/all/read`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to mark notification as read')
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <Heart className="h-4 w-4 text-red-500" />
            case 'comment':
                return <MessageCircle className="h-4 w-4 text-blue-500" />
            case 'repost':
                return <Repeat2 className="h-4 w-4 text-green-500" />
            case 'follow':
                return <UserPlus className="h-4 w-4 text-teal-500" />
            case 'unfollow':
                return <UserMinus className="h-4 w-4 text-teal-500" /> 
            default:
                return <Bell className="h-4 w-4" />
        }
    }

    const getNotificationText = (notification: Notification) => {
        switch (notification.type) {
            case 'like':
                return `a aimé votre post`
            case 'comment':
                return `a commenté votre post`
            case 'repost':
                return `a reposté votre post`
            case 'follow':
                return `vous a suivi`
            case 'unfollow':
                return `vous a supprimé`
            default:
                return `a interagi avec votre post`
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            <div className="space-y-4">
                {notifications.map((notification) => (
                    <Card
                        key={notification.id}
                        className={`cursor-pointer transition-colors ${notification.read ? 'bg-background' : 'bg-accent'}`}
                    >
                        <CardContent className="flex items-center space-x-4 p-4">
                            <Link href={`/users/${notification.actor.address}`}>
                                <Avatar className="hover:cursor-pointer hover:bg-blue-100 hover:ring-2 hover:ring-blue-300 transition-all duration-500">
                                    <AvatarImage src={notification.actor.avatar} alt={notification.actor.username} />
                                    <AvatarFallback>{notification.actor.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-1">
                                <p>
                                    <span className="font-semibold">{notification.actor.username}</span>{' '}
                                    {getNotificationText(notification)}
                                </p>
                                {notification.type !== 'follow' && notification.post && (
                                    <p style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }} className="text-sm text-muted-foreground truncate">{notification.post.content}</p>
                                )}
                                {notification.type === 'comment' && notification.comment && (
                                    <p style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }} className="text-sm text-muted-foreground truncate">{notification.comment.content}</p>
                                )}
                                <p className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
                            </div>
                            {getNotificationIcon(notification.type)}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
