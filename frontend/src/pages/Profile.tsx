import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Profile = () => {
  const user = {
    name: "John Doe",
    username: "johndoe",
    bio: "Développeur passionné par les technologies modernes.",
    avatarUrl: "https://via.placeholder.com/150",
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <Avatar src={user.avatarUrl} alt={user.name} className="mr-4" />
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-600">@{user.username}</p>
        </div>
      </div>
      <p className="mb-4">{user.bio}</p>
      <Button>Modifier le profil</Button>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">Posts récents</h3>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Post 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Contenu du post 1.</p>
          </CardContent>
        </Card>
        {/* Répéter pour d'autres posts */}
      </div>
    </div>
  );
};
