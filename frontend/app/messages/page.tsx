"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { io } from "socket.io-client";
import { useRouter } from 'next/navigation'

import UserSearchInput from "@/components/UserSearchInput"; // <-- L'import du composant

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newMessageUser, setNewMessageUser] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const router = useRouter()

  useEffect(() => {
    // Connexion Socket.io
    const socket = io("http://localhost:3001", {
      query: { token: localStorage.getItem("token") },
    });
    socket.emit("listenMyRooms");

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/api/messages", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok){
          router.push('/')
          throw new Error("Erreur lors du chargement des données");
        }
        const data = await response.json();
        setUserId(data.userId);
        setConversations(data.conversations || []);
        // setPendingRequests(data.pendingRequests || []);
      } catch (err: any) {
        setError(err.message || "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Écoute des nouveaux messages temps réel
    socket.on("receiveMessage", (messageData) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation.conversationId === messageData.conversationId) {
            return {
              ...conversation,
              lastMessage: messageData.content,
              timestamp: new Date(messageData.createdAt),
            };
          }
          return conversation;
        });

        updatedConversations.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        return updatedConversations;
      });
    });

    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, []);

  const handleNewConversation = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newMessageUser,
          content: newMessageContent,
        }),
      });
      if (!response.ok) throw new Error("Erreur lors de l'ajout de la conversation");

      const user = await response.json();
      if (user.isFollower) {
        setConversations((prev) => [...prev, user]);
      } else if (user.isFollowing) {
        setPendingRequests((prev) => [...prev, user]);
      }

      setNewMessageUser("");
      setNewMessageContent("");
    } catch (err: any) {
      setError(err.message || "Erreur inattendue");
    }
  };

  const handleAcceptRequest = async (requestUserId: string) => {
    try {
      const response = await fetch(
          `http://localhost:3001/api/messages/${requestUserId}/accept`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
      );
      if (!response.ok) throw new Error("Erreur lors de l'acceptation de la demande");

      const user = pendingRequests.find((u: any) => u.id === requestUserId);
      if (user) {
        setConversations((prev) => [...prev, user]);
        setPendingRequests((prev) => prev.filter((u: any) => u.id !== requestUserId));
      }
    } catch (err: any) {
      setError(err.message || "Erreur inattendue");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Messages</h2>
        <div className="space-y-4">
          {conversations.map((conversation: any) => {
            const { users, lastMessage, timestamp, conversationId } = conversation;
            const [user1, user2] = users;
            const userToDisplay = user1.id === userId ? user2 : user1;

            return (
                <Link href={`/messages/${conversationId}`} key={conversationId}>
                  <Card className="cursor-pointer hover:bg-accent transition-colors mb-4">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Link href={`/users/${userToDisplay.address}`}>
                        <Avatar className="mr-2 hover:cursor-pointer hover:bg-blue-100 hover:ring-2 hover:ring-blue-300 transition-all duration-500">
                          <AvatarImage
                              src={userToDisplay.avatar}
                              alt={userToDisplay.username}
                          />
                          <AvatarFallback>
                            {userToDisplay.username.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1">
                        <h3 className="font-semibold">@{userToDisplay.username}</h3>
                        <p className="text-sm text-muted-foreground">{lastMessage}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(timestamp).toLocaleString()}
                        </p>
                      </div>
                      <MessageSquare className="text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
            );
          })}

          {pendingRequests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Demandes de message en attente
                </h3>
                {pendingRequests.map((request: any) => (
                    <Card key={request.id}>
                      <CardContent className="p-4 flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={request.avatar} alt={request.username} />
                          <AvatarFallback>
                            {request.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">@{request.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            Souhaite vous envoyer un message
                          </p>
                        </div>
                        <Button onClick={() => handleAcceptRequest(request.id)}>
                          Accepter
                        </Button>
                      </CardContent>
                    </Card>
                ))}
              </div>
          )}

          {/* Nouvelle conversation */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Nouvelle conversation</h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Remplace l'ancien Input par ton composant de recherche */}
              <div className="flex-1">
                <UserSearchInput onSelectUser={(username) => setNewMessageUser(username)} />
              </div>

              <Input
                  placeholder="Message d'accroche"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  className="flex-1"
              />
              <Button onClick={handleNewConversation}>
                <UserPlus className="mr-2 h-4 w-4" />
                Démarrer
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
}
