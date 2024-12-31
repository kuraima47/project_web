"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link'

interface SearchResult {
  type: 'user' | 'post' | 'hashtag'
  id?: string
  username?: string
  avatar?: string
  bio?: string
  content?: string
  timestamp?: string
  hashtag?: string
  count?: number
}

export function AdvancedSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:3001/api/search?term=${searchTerm}&type=${searchType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      } else {
        throw new Error('Failed to fetch search results')
      }
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  return (
      <div>
        <form onSubmit={handleSearch} className="space-y-2 mb-6">
          <div className="flex space-x-2">
            <Input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
            />
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de recherche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="hashtag">Hashtag</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Rechercher</Button>
        </form>

        <div className="space-y-4">
          {searchResults.map((result, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  {result.type === 'user' && (
                      <Link href={`/users/${result.id}`} className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={result.avatar} alt={result.username} />
                          <AvatarFallback>{result.username?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">@{result.username}</p>
                          <p className="text-sm text-muted-foreground">{result.bio}</p>
                        </div>
                      </Link>
                  )}
                  {result.type === 'post' && (
                      <Link href={`/post/${result.id}`}>
                        <p className="font-semibold">@{result.username}</p>
                        <p>{result.content}</p>
                        <p className="text-sm text-muted-foreground">{result.timestamp}</p>
                      </Link>
                  )}
                  {result.type === 'hashtag' && (
                      <div>
                        <p className="font-semibold">#{result.hashtag}</p>
                        <p className="text-sm text-muted-foreground">{result.count} posts</p>
                      </div>
                  )}
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  )
}
