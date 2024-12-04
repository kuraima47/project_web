import React, { useEffect, useState } from "react";
import { NewPost } from "../components/NewPost";
import { Post } from "../components/Post";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export const Home = () => {
  const [posts, setPosts] = useState([]);
  const { toast } = useToast(); 

  useEffect(() => {
    const fetchTweets = async () => {
      try {

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/posts/recent", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts); // Assurez-vous que le backend renvoie un tableau complet des posts
        } else {
          toast({
            variant: "destructive",
            title: "Echec de la récupération des tweets",
            description: `Réponse ${response.status} ${response.statusText}`,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Echec de la récupération des tweets",
          description: error+"",
        });
      }
    };
  
    fetchTweets();
  }, []);
  

  const handleNewTweet = (newTweet) => {
    setPosts([newTweet, ...posts]);
  };

  return (
    <div className="form-container min-h-screen items-center">
      <div className="max-w-2xl w-full mx-auto bg-white">
        <h1 className="text-xl font-bold p-4 border-b border-gray-200">Fil d'actualité</h1>
        <NewPost onTweetPosted={handleNewTweet} />
        <div>
          {posts.map((post) => (
            <Post key={post.id} {...post} />
          ))}
        </div>
      </div>
      <Toaster />
    </div>
  );
};
