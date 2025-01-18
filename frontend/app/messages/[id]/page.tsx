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
  },
});

export default function Conversation() {
  const params = useParams();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [friendUser, setFriendUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [isSeen, setIsSeen] = useState(false);

  const scrollAreaRef = useRef(null);

  // Fetch initial conversation data
  useEffect(() => {
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
        // Join room after conversationId is set
        socket.emit("joinRoom", data.conversation.id);
      } catch (error) {
        console.error("Error fetching conversation:", error);
        router.push("/messages");
      }
    };
    fetchConversation();

    socket = io("http://localhost:3001", {
      query: {
        token: localStorage.getItem("token"),
      },
    });
    // Cleanup
    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [params.id, router]);

  const checkLastMessageSeen = async () => {
    const response = await fetch(
      `http://localhost:3001/api/messages/${conversationId}/isLastMessageSeen`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await response.json();
    setIsSeen(data.seen); // Met à jour l'état "isSeen"
  };

  // Vérifier si le dernier message a été vu
  useEffect(() => {


    if (conversationId) {
      checkLastMessageSeen();
    }

    const markAsSeen = async () => {
      await fetch(
        `http://localhost:3001/api/messages/${conversationId}/markAsSeen`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
    }

    socket.on("receiveMessage", async (message) => {
      await markAsSeen();
      setMessages((prevMessages) => [...prevMessages, message]);
      checkLastMessageSeen();
    });

    socket.on("refresh", async () => {
      console.log("refresh room");
      checkLastMessageSeen();
    })

    return () => {
      socket.off("receiveMessage");
    };
  }, [conversationId]);


  // Scroll to the bottom when new messages are added
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
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

        if (response.ok) {
          socket.emit("sendMessage", { roomId: conversationId, message });
          checkLastMessageSeen();
          const savedMessage = await response.json();
        } else {
          console.error("Error sending message:", response.statusText);
        }
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const renderSeenStatus = (message, index) => {
    // Vérifiez si c'est le dernier message envoyé par le currentUser
    const isLastMessage = 
      index === messages.length - 1 && 
      message.senderId === currentUser.id;

    console.log(index);
  
    // Affichez "Vu" uniquement si c'est le dernier message envoyé
    return isLastMessage && isSeen ? (
      <p className="text-xs text-muted-foreground">Vu</p>
    ) : null;
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
                {renderSeenStatus(message, index)} {/* Affichage conditionnel du message "Vu" */}
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
