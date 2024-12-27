"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Conversation() {
  const params = useParams();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [friendUser, setFriendUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        // Récupérer les détails de la conversation
        const conversationResponse = await fetch(`http://localhost:3001/api/messages/${params.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const conversationData = await conversationResponse.json();
        setFriendUser(conversationData.friendUser);
        setCurrentUser(conversationData.currentUser);
        setMessages(conversationData.conversation.messages);
        setConversation(conversationData.conversation.id);
      } catch (error) {
        console.error("Error fetching conversation data:", error);
        router.push("/messages");
      }
    };

    fetchConversation();
  }, [params.id, router]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMsg = {
        content: newMessage,
      };

      try {
        // Envoi du message à la conversation avec l'ID dans l'URL
        const response = await fetch(`http://localhost:3001/api/messages/${friendUser.id}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify(newMsg),
        });

        if (response.ok) {
          const savedMessage = await response.json();
          setMessages((prev) => [...prev, savedMessage]);
          setNewMessage("");
        } else {
          console.error("Error sending message:", response.statusText);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  if (!friendUser && !currentUser) return null;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.push("/messages")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Avatar className="mr-2">
          <AvatarImage src={friendUser.avatar} alt={friendUser.username} />
          <AvatarFallback>{friendUser.username}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold">Conversation avec {friendUser.username}</h2>
      </div>
      <ScrollArea className="flex-grow mb-4 p-4 border rounded-lg">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender.username === currentUser.username ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg ${message.sender.username === currentUser.username
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs text-right mt-1">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Input
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
