"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/contexts/auth-context";
import { EditProfileModal } from "@/components/edit-profile-modal";
import { Repeat2 } from 'lucide-react'
import { getApiUrl } from "@/utils/address";

export default function UserProfile() {
  const { address } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    checkIfFollowing();
    fetchFollowers();
    fetchFollowing();
  }, [address]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/api/users/profile/${address}`),
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

  const fetchFollowers = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/api/users/${address}/followers`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
      } else {
        throw new Error("Failed to fetch followers");
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/api/users/${address}/following`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setFollowing(data);
      } else {
        throw new Error("Failed to fetch following");
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/api/posts/user/${address}`),
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

  const checkIfFollowing = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        getApiUrl(`/api/users/${address}/doFollow/`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      } else {
        throw new Error("Failed to check follow status");
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const followUser = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/api/users/${address}/follow`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        setIsFollowing(true);
        fetchFollowers();
      } else {
        throw new Error("Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const unfollowUser = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/api/users/${address}/unfollow`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        setIsFollowing(false);
        fetchFollowers();
      } else {
        throw new Error("Failed to unfollow user");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const closePopup = () => {
    setIsFollowersOpen(false);
    setIsFollowingOpen(false);
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
              <AvatarImage src={user.avatar} alt={user.username || user.address} />
              <AvatarFallback>
                {user.username ? user.username[0].toUpperCase() : user.address.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">
                {user.username || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
              </CardTitle>
              <p className="text-muted-foreground">{user.bio || "Cet utilisateur n'a pas de bio."}</p>
              <div className="flex space-x-4 mt-2 text-sm">
                <button
                  className="text-primary hover:underline"
                  onClick={() => setIsFollowersOpen(true)}
                >
                  {followers.length || 0} abonnés
                </button>
                <button
                  className="text-primary hover:underline"
                  onClick={() => setIsFollowingOpen(true)}
                >
                  {following.length || 0} abonnements
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
            <div key={post.id} className="relative">
              {/* Badge "Repost" if post is a repost */}
              {post.authorId != user.id && (
                <div className="absolute top-2 right-2 p-2 m-1 bg-emerald-600 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded-full flex items-center space-x-1">
                  <span className="font-bold">RT</span>
                  <Repeat2 className="mr-2 h-4 w-4 transition-colors duration-300 text-green-100" />
                </div>
              )}
              <PostCard key={post.id} {...post} onUpdate={fetchUserPosts} />
            </div>
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

      {/* Popup for followers */}
      {isFollowersOpen && (
        <Popup title="Abonnés" users={followers} onClose={() => setIsFollowersOpen(false)} />
      )}

      {/* Popup for following */}
      {isFollowingOpen && (
        <Popup title="Abonnements" users={following} onClose={() => setIsFollowingOpen(false)} />
      )}
    </div>
  );
}

function Popup({ title, users, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="font-bold">×</span>
          </button>
        </div>
        <div>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucun utilisateur trouvé.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id} className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.username || user.address} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.username || user.address}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
