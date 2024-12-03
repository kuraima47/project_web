import React from 'react';
import { Heart, MessageCircle, Repeat } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PostProps {
  author: string
  content: string
  timestamp: string
  likes: number
  comments: number
  retweets: number
}

export function Post({ author, content, timestamp, likes, comments, retweets }: PostProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center mb-2">
        <img
          src={"/placeholder.svg?height=40&width=40"}
          alt={author}
          className="w-10 h-10 rounded-full mr-2"
        />
        <div>
          <h3 className="font-bold">{author}</h3>
          <p className="text-sm text-gray-500">{timestamp}</p>
        </div>
      </div>
      <p className="mb-2">{content}</p>
      <div className="flex space-x-5 text-gray-500">
        <Button variant="outline" size="sm">
          <MessageCircle size={18} className="mr-1" />
          {comments}
        </Button>
        <Button variant="outline" size="sm">
          <Repeat size={18} className="mr-1" />
          {retweets}
        </Button>
        <Button variant="outline" size="sm">
          <Heart size={18} className="mr-1" />
          {likes}
        </Button>
      </div>
    </div>
  );
}
