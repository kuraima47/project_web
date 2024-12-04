import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from "@/components/ui/toaster";

export const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    displayName: '',
    email: '',
    bio: '',
    profilePicture: '',
  });
  const [updatedProfile, setUpdatedProfile] = useState(profile);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
          setUpdatedProfile(data.user);
        } else {
          toast({
            variant: 'destructive',
            title: 'Failed to load profile',
            description: `Error: ${response.statusText}`,
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load profile',
          description: error.message,
        });
      }
    };

    fetchProfile();
  }, [toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('displayName', updatedProfile.displayName);
    formData.append('username', updatedProfile.username);
    formData.append('bio', updatedProfile.bio);
    if (profileImage) {
      formData.append('profilePicture', profileImage);
    }

    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        toast({
          variant: 'default',
          title: 'Profil mis à jour avec succès',
        });
        navigate('/');
      } else {
        console.log(response);
        toast({
          variant: 'destructive',
          title: 'Echec lors de la mise à jour du profil',
          description: `Erreur: ${response.statusText} nom d'utilisateur déjà pris`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Echec lors de la mise à jour du profil',
        description: error+"",
      });
    }
  };

  return (
    <div className="form-container min-h-screen items-center">
      <Toaster/>
      <div className="max-w-2xl w-full mx-auto bg-white">
        <h1 className="text-xl font-bold p-4 border-b border-gray-200">Modifier votre profil</h1>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nom d'utilisateur
            </label>
            <Input
              id="username"
              type="text"
              value={updatedProfile.username}
              onChange={(e) =>
                setUpdatedProfile({ ...updatedProfile, username: e.target.value })
              }
              maxLength={20}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Nom affiché
            </label>
            <Input
              id="displayName"
              type="text"
              value={updatedProfile.displayName}
              onChange={(e) =>
                setUpdatedProfile({ ...updatedProfile, displayName: e.target.value })
              }
              maxLength={20}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Votre description
            </label>
            <Textarea
              id="bio"
              value={updatedProfile.bio}
              onChange={(e) =>
                setUpdatedProfile({ ...updatedProfile, bio: e.target.value })
              }
            />
          </div>
          <div className="mb-4">
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
              Photo de profil
            </label>
            <Input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="mb-4">
            {profile.profilePicture && (
              <img
                src={profile.profilePicture}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover"
              />
            )}
          </div>
          <Button type="submit" className="w-full">
            Enregistrer les modifications
          </Button>
        </form>
      </div>
    </div>
  );
};