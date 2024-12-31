"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { io } from "socket.io-client";

let socket = io("http://localhost:3001", {
  query: {
    token: localStorage.getItem("token"), // Le token pour l'authentification, mais pas nécessaire pour la room -1
  }
});

export default function Anarchie() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null); // Référence pour l'utilisateur actuel
  const [lastSent, setLastSent] = useState(null); // Temps du dernier message envoyé
  const [cooldown, setCooldown] = useState(false); // Flag pour gérer le cooldown
  const [progress, setProgress] = useState(0); // Pour gérer l'animation de la barre
  const messagesEndRef = useRef(null); // Pour le scroll automatique
  const scrollAreaRef = useRef(null); // Référence pour la zone de scroll

  // Écouter les messages reçus en temps réel
  useEffect(() => {
    const fetchConversation = async () => {
      const response = await fetch(`http://localhost:3001/api/users/fromToken/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setUser(data);
    };
    fetchConversation();

    // Connexion au socket
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => {
        const updatedMessages = [message, ...prevMessages]; // Inverser l'ordre des messages
        // Garder les 1000 derniers messages
        const sortedMessages = updatedMessages.slice(0, 1000).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return sortedMessages;
      });
    });

    // Rejoindre la room "anarchie" (-1)
    socket.emit("joinRoom", -1);

    // Cleanup
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  // Scroll automatique vers le bas quand un nouveau message est ajouté
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Gérer la progression de la barre
  useEffect(() => {
    let interval;
    if (cooldown) {
      let timeLeft = 10; // 100 dixieme secondes de cooldown
      setProgress(0); // Réinitialiser la barre

      interval = setInterval(() => {
        if (timeLeft > 0) {
          setProgress((prevProgress) => (prevProgress + 10)); // Augmenter la barre
          timeLeft -= 1;
        } else {
          clearInterval(interval); // Arrêter la barre de progression quand le cooldown est terminé
          setCooldown(false); // Réinitialiser le cooldown
        }
      }, 1000);
    } else {
        setProgress(0);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (cooldown) {
      alert("Vous devez attendre 10 secondes avant d'envoyer un autre message.");
      return;
    }

    if (newMessage.trim().length === 0) {
      alert("Le message ne peut pas être vide.");
      return;
    }

    if (newMessage.trim().length > 120) {
      alert("Le message ne peut pas dépasser 120 caractères.");
      return;
    }

    const message = {
      content: newMessage,
      user: user, // ID de l'utilisateur
      createdAt: new Date(),
    };

    try {
      socket.emit("sendMessage", { roomId: -1, message }); // Envoyer le message à la room -1
      setNewMessage(""); // Réinitialiser le champ de message
      setLastSent(new Date()); // Mettre à jour le dernier envoi
      setCooldown(true); // Activer le cooldown
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <h2 className="text-2xl font-semibold mb-4">Anarchie - Chat Chaotique</h2>
      <ScrollArea ref={scrollAreaRef} className="flex-grow mb-4 p-4 border rounded-lg">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="flex justify-start w-full">
              <div className="w-full p-2 rounded-lg bg-muted">
                <div className="flex items-center">
                  <Avatar className="mr-2">
                    <AvatarImage src={message.user.avatar} alt={message.user.username} />
                    <AvatarFallback>{message.user.username}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-semibold">{message.user.username}</p>
                    <p>{message.content}</p>
                    <p className="text-xs text-right mt-1">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
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
          maxLength={120} // Limite de caractères sur le champ
        />
        <Button type="submit" disabled={cooldown}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

        <div className="space-y-4">
            <div className="h-1 bg-gray-300 mt-2 w-[90%] mx-auto rounded-full">
            <div
            className="h-full bg-blue-600 transition-all rounded-full"
            style={{ width: `${progress}%` }}
            />
        </div>
      </div>
    </div>
  );
}
