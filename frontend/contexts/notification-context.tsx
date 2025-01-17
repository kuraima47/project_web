"use client";

import React, { createContext, useContext, useState } from "react";
import { CustomToast } from "@/components/ui/customToast";

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
  const [unreadCount, setUnreadCount] = useState(0);

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
