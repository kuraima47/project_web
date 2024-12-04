import React from "react";
import { Link } from "react-router-dom";
import { Home, Bell, Mail, User, LogOut } from "lucide-react";
export const Menu = () => {
  const menuItems = [
    { label: "Accueil", icon: <Home className="w-5 h-5" />, path: "/" },
    { label: "Messages", icon: <Mail className="w-5 h-5" />, path: "/messages" },
    { label: "Notifications", icon: <Bell className="w-5 h-5" />, path: "/notifications" },
    { label: "Profil", icon: <User className="w-5 h-5" />, path: "/profile" },
    { label: "Déconnexion", icon: <LogOut className="w-5 h-5" />, path: "/logout" }
  ];

  return (
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:flex md:flex-col md:h-screen md:w-64 md:border-r md:border-t-0 z-50">
  <div className="flex flex-col justify-center h-screen space-y-4">
    {menuItems.map((item) => (
      <Link
        to={item.path}
        key={item.label}
        className="flex items-center space-x-3 text-gray-700 hover:text-blue-500 text-lg">
        <div className="w-8 h-8 flex items-center justify-center">
          {item.icon}
        </div>
        <span className="hidden md:inline">{item.label}</span>
      </Link>
    ))}
  </div>
</nav>

  );
};
