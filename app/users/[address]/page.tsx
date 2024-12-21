"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostCard } from "@/components/post-card"
import { useAuth } from '@/contexts/auth-context'
import { EditProfileModal } from "@/components/edit-profile-modal"

export default function UserProfile() {
  const { address } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchUserProfile()
    fetchUserPosts()
  }, [address])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/profile/${address}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        throw new Error('Failed to fetch user profile')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/user/${address}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else {
        throw new Error('Failed to fetch user posts')
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const isOwnProfile = currentUser && currentUser.address.toLowerCase() === user.address.toLowerCase()

  return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.username || user.address} />
                <AvatarFallback>{user.username ? user.username[0].toUpperCase() : user.address.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.username || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}</CardTitle>
                <p className="text-muted-foreground">{user.bio || 'No bio available'}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold">{user.followers || 0} abonnés</p>
                <p className="font-semibold">{user.following || 0} abonnements</p>
              </div>
              {isOwnProfile ? (
                  <Button onClick={() => setIsEditModalOpen(true)}>Modifier le profil</Button>
              ) : (
                  <Button>S'abonner</Button>
              )}
            </div>
          </CardContent>
        </Card>
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        <div className="space-y-4">
          {posts.map((post) => (
              <PostCard
                  key={post.id}
                  {...post}
                  onUpdate={fetchUserPosts}
              />
          ))}
        </div>
        {isOwnProfile && (
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => {
                  setIsEditModalOpen(false)
                  fetchUserProfile()
                }}
                currentUsername={user.username}
                currentAvatar={user.avatar}
                currentBio={user.bio || ''}
            />
        )}
      </div>
  )
}

