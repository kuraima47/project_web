'use client'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";

export const NewPost = ({ onTweetPosted }) => {
  const [content, setContent] = useState("");
  const { toast } = useToast(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const newTweet = await response.json();
        setContent("");
        onTweetPosted(newTweet.post);
      } else {
        toast({
          variant: "destructive",
          title: "Echec de l'envoi du tweet",
          description: "réponse "+response.status+" "+response.statusText
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Echec de l'envoi du tweet",
        description: "info:"+error
      });
    }
  };

  return (
  <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200">
    <Textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="Une pensée à partager ?"
      className="w-full p-2 mb-2"
      maxLength={280}
    />
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{280 - content.length} caractères restants</span>
      <Button type="submit" disabled={content.length === 0}>Poster</Button>
    </div>
    <Toaster />
  </form>
  );
};


