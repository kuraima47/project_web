"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useNotification } from "@/contexts/notification-context";
import { getWsNotificationsUrl, getWsNotificationsPath } from "@/utils/address";

export function ToastNotification() {
  const { notify } = useNotification();

  useEffect(() => {
    // Connexion WebSocket avec le token utilisateur

    console.log(getWsNotificationsUrl+"   "+getWsNotificationsPath())
    const socket = io(getWsNotificationsUrl(), {
      query : { 
        token: localStorage.getItem("token") 
      },
      path: getWsNotificationsPath()
    });

    // Recevoir les notifications en temps réel via WebSocket
    socket.on("receiveNotification", (data) => {
      const { type, actor, message, hrefValue } = data;
      notify(type,actor.username,actor.avatar,actor.address,message,hrefValue);
    });

    // Cleanup du socket à la déconnexion du composant
    return () => {
      socket.off("receiveNotification");
      socket.disconnect();
    };
  }, [notify]);

  return null; // Pas besoin d'afficher quoi que ce soit, juste écouter
}
