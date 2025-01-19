"use client"

import {useAuth } from '@/contexts/auth-context'
import { BottomNav } from '@/components/bottom-nav'
import { SidebarNav } from '@/components/sidebar-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { ToastNotification } from "@/components/ToastNotification"
import { NotificationProvider } from '@/contexts/notification-context'
import {useContext, useState} from "react";
import {QuestContext} from "@/contexts/QuestContext";

export function LayoutWithAuth({ children }: { children: React.ReactNode }) {
    const { user, isLoading } =  useAuth();


  
    // On s'assure que l'utilisateur est authentifié avant d'afficher le ToastNotification
    return (
      <div className="flex min-h-screen">
        <NotificationProvider>
          <SidebarNav />
          <ToastNotification />
          <main className="flex-1 md:ml-64">
            <div className="max-w-3xl mx-auto p-4">
              <div className="flex justify-end mb-4">
                <ThemeToggle />
              </div>
              {children}
            </div>
          </main>
          <BottomNav />
        </NotificationProvider>
      </div>
    )
  }