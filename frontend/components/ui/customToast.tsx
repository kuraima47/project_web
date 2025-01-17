"use client";

import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Repeat2, UserPlus, UserMinus, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils";
import Link from 'next/link'

type ToastType = "follow" | "unfollow" | "like" | "repost" | "comment" | "message";

type ToastProps = {
  type: ToastType;
  username: string;
  avatar: string;
  address:string;
  message: string;
  hrefValue: string;
  onClose: () => void;
};

export function CustomToast({ type, username, avatar, address, message, hrefValue, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    follow: <UserPlus className="text-green-500 h-6 w-6" />,
    unfollow: <UserMinus className="text-black-500 h-6 w-6" />,
    like: <Heart className="text-red-500 h-6 w-6" />,
    repost: <Repeat2 className="text-green-500 h-6 w-6" />,
    comment: <MessageCircle className="text-blue-500 h-6 w-6" />,
  };

  return (
    <Link href={`${hrefValue}`}>
      <div
        className={cn(
          "fixed top-5 right-5 max-w-sm w-full bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4 transition-transform duration-300 ease-in-out",
          {
            "translate-y-0 opacity-100": visible,
            "-translate-y-5 opacity-0": !visible,
          }
        )}
      >
        
        <Link href={`/users/${address}`}>
          <Avatar className="hover:cursor-pointer hover:bg-blue-100 hover:ring-2 hover:ring-blue-300 transition-all duration-500">
            <AvatarImage src={avatar} alt={username} />
            <AvatarFallback>{username[0]}</AvatarFallback>
          </Avatar>
        </Link>
        {icons[type]}
        <span className="text-foreground flex-1">{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="text-muted-foreground hover:text-foreground transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </Link>
  );
}
