"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { io } from "socket.io-client"; // Importez socket.io

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newMessageUser, setNewMessageUser] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Connexion au serveur WebSocket
    const socket = io("http://localhost:3001", {
      query: { token: localStorage.getItem('token') },
    });
    socket.emit("listenMyRooms");

    // Fonction pour récupérer les conversations et demandes en attente
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/messages', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        if (!response.ok) throw new Error("Erreur lors du chargement des données");
        const data = await response.json();
        setUserId(data.userId);

        setConversations(data.conversations || []);
        // setPendingRequests(data.pendingRequests || []); // Décommente si tu as des demandes en attente
      } catch (err) {
        setError(err.message || "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Écouter les nouveaux messages en temps réel
    socket.on("receiveMessage", (messageData) => {


      console.log(messageData);
      // Mettez à jour les conversations avec le dernier message
      setConversations((conversations) => {
        // Met à jour la conversation concernée
        const updatedConversations = conversations.map((conversation) => {

          console.log(conversation.conversationId);
          console.log(messageData.conversationId);
          if (conversation.conversationId === messageData.conversationId) {
            return {
              ...conversation,
              lastMessage: messageData.content, // Met à jour le dernier message
              timestamp: new Date(messageData.createdAt), // Met à jour le timestamp du message
            };
          }
          return conversation;
        });

        // Trie les conversations par date de dernier message, du plus récent au plus ancien
        updatedConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        


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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: newMessageUser, content: newMessageContent }),
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
    } catch (err) {
      setError(err.message || "Erreur inattendue");
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${userId}/accept`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error("Erreur lors de l'acceptation de la demande");

      const user = pendingRequests.find((u) => u.id === userId);
      if (user) {
        setConversations((prev) => [...prev, user]);
        setPendingRequests((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      setError(err.message || "Erreur inattendue");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Messages</h2>
      <div className="space-y-4">
        {conversations.map((conversation) => {
          const { users, lastMessage, timestamp, conversationId } = conversation;
          const [user1, user2] = users; 

          const userToDisplay = user1.id === userId ? user2 : user1;

          return (
            <Link href={`/messages/${conversationId}`} key={conversationId}>
              <Card className="cursor-pointer hover:bg-accent transition-colors mb-4">
                <CardContent className="p-4 flex items-center space-x-4">
                  <Link href={`/users/${userToDisplay.address}`}>
                    <Avatar className="mr-2 hover:cursor-pointer hover:bg-blue-100 hover:ring-2 hover:ring-blue-300 transition-all duration-500">
                      <AvatarImage src={userToDisplay.avatar} alt={userToDisplay.username} />
                      <AvatarFallback>{userToDisplay.username.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <h3 className="font-semibold">@{userToDisplay.username}</h3>
                    <p className="text-sm text-muted-foreground">{lastMessage}</p>
                    <p className="text-xs text-muted-foreground">{new Date(timestamp).toLocaleString()}</p>
                  </div>
                  <MessageSquare className="text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {pendingRequests.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Demandes de message en attente</h3>
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4 flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={request.avatar} alt={request.username} />
                    <AvatarFallback>{request.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">@{request.username}</h3>
                    <p className="text-sm text-muted-foreground">Souhaite vous envoyer un message</p>
                  </div>
                  <Button onClick={() => handleAcceptRequest(request.id)}>Accepter</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Nouvelle conversation</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              placeholder="Nom d'utilisateur"
              value={newMessageUser}
              onChange={(e) => setNewMessageUser(e.target.value)}
              className="flex-1"
            />
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
