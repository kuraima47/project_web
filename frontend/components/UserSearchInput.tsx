"use client"

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getApiUrl } from "@/utils/address";

interface SearchResult {
    type: 'user' | 'post' | 'hashtag';
    id?: string;
    address?: string;
    username?: string;
    avatar?: string;
    bio?: string;
}

interface UserSearchInputProps {
    onSelectUser: (username: string) => void;
}

export default function UserSearchInput({ onSelectUser }: UserSearchInputProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleSearch = async (term: string) => {
        try {
            if (!term) {
                setSearchResults([]);
                return;
            }
            // Appel à l’API pour ne récupérer que des users
            const response = await fetch(
                getApiUrl(`/api/search?term=${term}&type=user`),
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch search results");
            }

            const data = await response.json();
            setSearchResults(data);
            setShowDropdown(true);
        } catch (error) {
            console.error("Error searching:", error);
        }
    };

    const handleSelectUser = (username: string) => {
        onSelectUser(username);
        setSearchTerm(username);
        setSearchResults([]);
        setShowDropdown(false);
    };

    // Gestion du clic hors du composant pour fermer la liste de résultats
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <Input
                placeholder="Nom d'utilisateur"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                }}
                onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                }}
            />

            {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-y-auto">
                    {searchResults.map((user, idx) => (
                        <Card
                            key={idx}
                            className="hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
                            onClick={() => handleSelectUser(user.username ?? "")}
                        >
                            <CardContent className="p-2 flex items-center space-x-2">
                                <Avatar>
                                    <AvatarImage src={user.avatar} alt={user.username} />
                                    <AvatarFallback>
                                        {user.username?.[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">@{user.username}</p>
                                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
