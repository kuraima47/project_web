"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, Video } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getApiUrl } from '@/utils/address'
interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<File | null>(null)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const formData = new FormData()
    formData.append('content', content)
    if (media) {
      formData.append('media', media)
    }

    try {
      const response = await fetch(getApiUrl('/api/posts'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (response.ok) {
        setContent('')
        setMedia(null)
        onPostCreated()
      } else {
        throw new Error('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0])
    }
  }

  return (
      <div>
        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-4 mb-4">
          <Textarea
              placeholder="Qu'avez-vous en tête ?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-2 bg-background text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between">
            <div>
              <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                  id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                {media ? (
                    <span className="text-primary">{media.name}</span>
                ) : (
                    <div className="flex items-center space-x-2">
                      <ImagePlus className="h-5 w-5 text-primary" />
                      <Video className="h-5 w-5 text-primary" />
                      <span className="text-primary">Ajouter média</span>
                    </div>
                )}
              </label>
            </div>
            <Button type="submit">Poster</Button>
          </div>
        </form>
      </div>
  )
}

