"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CustomToast } from "@/components/ui/customToast";
import { getApiUrl } from "@/utils/address";

type NotificationContextType = {
  notify: (
    type: "follow" | "unfollow" | "like" | "repost" | "comment" | "message",
    username: string,
    avatar: string,
    address: string,
    message: string,
    hrefValue: string
  ) => void;
  unreadCount: number;
  resetUnread: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    type: string;
    username: string;
    avatar: string;
    address: string;
    message: string;
    hrefValue: string;
  } | null>(null);


  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch(getApiUrl("/api/notifications/unread"), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok){
        throw new Error("Erreur lors du chargement des notifications");
      }
      const data = await response.json();
      setUnreadCount(data.length);
    } catch (err: any) {
      console.log(err);
    }
  }

  const [unreadCount, setUnreadCount] = useState(fetchUnreadNotifications());
  useEffect(() => {
    fetchUnreadNotifications();
  })

  const notify = (
    type: "follow" | "unfollow" | "like" | "repost" | "comment" | "message",
    username: string,
    avatar: string,
    address: string,
    message: string,
    hrefValue: string
  ) => {
    setToast({ type, username, avatar, address, message, hrefValue });
    setUnreadCount((prevCount) => prevCount + 1); // Incrémente le compteur
  };

  const clearToast = () => {
    setToast(null);
  };

  const resetUnread = () => {
    setUnreadCount(0); // Réinitialise les notifications non lues
  };

  return (
    <NotificationContext.Provider value={{ notify, unreadCount, resetUnread }}>
      {children}
      {toast && (
        <CustomToast
          type={toast.type as "follow" | "unfollow" | "like" | "repost" | "comment" | "message"}
          username={toast.username}
          avatar={toast.avatar}
          address={toast.address}
          message={toast.message}
          hrefValue={toast.hrefValue}
          onClose={clearToast}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
