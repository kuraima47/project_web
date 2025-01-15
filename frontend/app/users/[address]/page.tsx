"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/contexts/auth-context";
import { EditProfileModal } from "@/components/edit-profile-modal";

export default function UserProfile() {
  const { address } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // Nouvel état pour suivre si l'utilisateur suit ou non

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    checkIfFollowing(); // Vérifier si l'utilisateur suit ce profil
  }, [address]);

  // Récupérer les informations du profil de l'utilisateur
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/profile/${address}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Récupérer les posts de l'utilisateur
  const fetchUserPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/posts/user/${address}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        throw new Error("Failed to fetch user posts");
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  // Vérifier si l'utilisateur connecté suit cet utilisateur
  const checkIfFollowing = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/users/${address}/following/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setIsFollowing(data.isFollowing); // Met à jour l'état de l'abonnement
        
      } else {
        throw new Error("Failed to check follow status");
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  // Fonction pour s'abonner
  const followUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/${address}/follow`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        setIsFollowing(true); // Utilisateur désormais abonné
      } else {
        throw new Error("Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Fonction pour se désabonner
  const unfollowUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/${address}/unfollow`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        setIsFollowing(false); // Utilisateur ne suit plus
      } else {
        throw new Error("Failed to unfollow user");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const isOwnProfile =
    currentUser && currentUser.address.toLowerCase() === user.address.toLowerCase();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={user.avatar}
                alt={user.username || user.address}
              />
              <AvatarFallback>
                {user.username
                  ? user.username[0].toUpperCase()
                  : user.address.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">
                {user.username ||
                  `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
              </CardTitle>
              <p className="text-muted-foreground">{user.bio || "No bio available"}</p>
              <div className="flex space-x-4 mt-2 text-sm">
                <button className="text-primary hover:underline">
                  {user.followers || 0} abonnés
                </button>
                <button className="text-primary hover:underline">
                  {user.following || 0} abonnements
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-end">
          {isOwnProfile ? (
            <Button onClick={() => setIsEditModalOpen(true)}>Modifier le profil</Button>
          ) : (
            <Button
              onClick={isFollowing ? unfollowUser : followUser}
              className="text-white bg-blue-500 hover:bg-blue-600"
            >
              {isFollowing ? "Se désabonner" : "S'abonner"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Posts Section */}
      <h2 className="text-xl font-semibold mb-4">Posts</h2>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div>Aucun post trouvé.</div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} {...post} onUpdate={fetchUserPosts} />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            fetchUserProfile();
          }}
          currentUsername={user.username}
          currentAvatar={user.avatar}
          currentBio={user.bio || ""}
        />
      )}
    </div>
  );
}
