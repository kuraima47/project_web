"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { io } from "socket.io-client";
import Link from "next/link";

let socket = io("http://localhost:3001", {
  query: {
    token: localStorage.getItem("token"),
  }
});

export default function Conversation() {
  const params = useParams();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [friendUser, setFriendUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  
  const scrollAreaRef = useRef(null); // Ref pour la ScrollArea

  useEffect(() => {
    socket = io("http://localhost:3001", {
      query: {
        token: localStorage.getItem("token"),
      }
    });
    const fetchConversation = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/messages/${params.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();

        setFriendUser(data.friendUser);
        setCurrentUser(data.currentUser);
        setMessages(data.conversation.messages);
        setConversationId(data.conversation.id);

        // Rejoindre la salle WebSocket
        socket.emit("joinRoom", data.conversation.id);
      } catch (error) {
        console.error("Error fetching conversation:", error);
        router.push("/messages");
      }
    };

    fetchConversation();

    // Écouter les messages reçus en temps réel
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup
    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [params.id, router]);

  const messagesEndRef = useRef(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  // Scroll automatique vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    scrollToBottom()
  }, [messages]); // Re-exécuter chaque fois que messages change

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMsg = {
        content: newMessage,
      };

      const message = {
        content: newMessage,
        senderId: currentUser.id,
        receiverId: friendUser.id,
        conversationId,
        createdAt: new Date(),
      };

      try {
        const response = await fetch(`http://localhost:3001/api/messages/${friendUser.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(newMsg),
        });

        setNewMessage("");
        if (response.ok) {
          socket.emit("sendMessage", { roomId: conversationId, message });
          const savedMessage = await response.json();
        } else {
          console.error("Error sending message:", response.statusText);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  if (!friendUser || !currentUser) return null;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.push("/messages")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Link href={`/users/${friendUser.address}`}>
          <Avatar className="mr-2 hover:cursor-pointer hover:bg-blue-100 hover:ring-2 hover:ring-blue-300 transition-all duration-500">
            <AvatarImage src={friendUser.avatar} alt={friendUser.username} />
            <AvatarFallback>{friendUser.username}</AvatarFallback>
          </Avatar>
        </Link>
        <h2 className="text-2xl font-semibold">Conversation avec {friendUser.username}</h2>
      </div>
      <ScrollArea className="flex-grow mb-4 p-4 border rounded-lg">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.senderId === currentUser.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg ${
                  message.senderId === currentUser.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs text-right mt-1">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div ref={messagesEndRef} />
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
