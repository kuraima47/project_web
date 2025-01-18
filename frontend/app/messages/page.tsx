"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";

import UserSearchInput from "@/components/UserSearchInput"; // <-- L'import du composant

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newMessageUser, setNewMessageUser] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Connexion Socket.io
    const socket = io("http://localhost:3001", {
      query: { token: localStorage.getItem("token") },
    });
    // Le serveur écoute l'événement "listenMyRooms" pour
    // inscrire ce client dans toutes ses "rooms" (conversations).
    socket.emit("listenMyRooms");

    socket.on("receiveNewConversation", () => {
      fetchData();
    });

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/api/messages", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          // Si pas OK, on redirige vers la home (ou une page de login)
          router.push("/");
          throw new Error("Erreur lors du chargement des données");
        }

        const data = await response.json();
        setUserId(data.userId);

        // On initialise nos conversations avec les données du serveur.
        // On peut ajouter `unread: false` à l'initialisation
        // si tu veux être sûr que par défaut elles soient marquées comme lues.
        const initialConversations = (data.conversations || []).map((conv: any) => ({
          ...conv,
          unread: false, // ou true si tu veux un autre comportement par défaut
        }));

        setConversations(initialConversations);
        setPendingRequests(data.pendingRequests || []);
      } catch (err: any) {
        setError(err.message || "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Écoute des nouveaux messages en temps réel
    socket.on("receiveMessage", (messageData) => {
      // Quand on reçoit un nouveau message, on met à jour la conversation correspondante
      setConversations((prev) => {
        const updatedConversations = prev.map((conversation: any) => {
          if (conversation.conversationId === messageData.conversationId) {
            return {
              ...conversation,
              lastMessage: messageData.content,
              timestamp: new Date(messageData.createdAt),
              // On marque la conversation comme "non lue"
              unread: true,
            };
          }
          return conversation;
        });

        // Trie les conversations par date de dernier message (le plus récent en premier)
        updatedConversations.sort(
            (a: any, b: any) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return updatedConversations;
      });
    });

    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [router]);

  const handleNewConversation = async () => {
    try {
      const socket = io("http://localhost:3001", {
        query: { token: localStorage.getItem("token") },
      });
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
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la conversation");
      }

      const user = await response.json();

      // Selon ta logique, le serveur peut renvoyer si c'est un follower/following
      // On l'ajoute simplement à la liste des conversations
      if (user.isFollower) {
        setConversations((prev) => [...prev, user]);
      } else if (user.isFollowing) {
        setPendingRequests((prev) => [...prev, user]);
      }
      socket.emit("newConversation", user.id);
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
            const { users, lastMessage, timestamp, conversationId, unread } = conversation;
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
                          {timestamp && new Date(timestamp).toLocaleString()}
                        </p>
                      </div>

                      {/* Icône de message */}
                      <MessageSquare className="text-muted-foreground" />

                      {/* Badge "NEW" si la conversation a un message non lu */}
                      {unread && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold ml-2">
                      NEW
                    </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
            );
          })}

          {pendingRequests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Demandes de message en attente</h3>
                {pendingRequests.map((request: any) => (
                    <Card key={request.id}>
                      <CardContent className="p-4 flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={request.avatar} alt={request.username} />
                          <AvatarFallback>{request.username[0].toUpperCase()}</AvatarFallback>
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
