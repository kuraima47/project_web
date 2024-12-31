import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from '@/contexts/auth-context'

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    currentUsername: string
    currentAvatar: string
    currentBio: string
}

export function EditProfileModal({ isOpen, onClose, currentUsername, currentAvatar, currentBio }: EditProfileModalProps) {
    const [username, setUsername] = useState(currentUsername)
    const [avatar, setAvatar] = useState(currentAvatar)
    const [bio, setBio] = useState(currentBio)
    const [error, setError] = useState('')
    const { updateUser } = useAuth()

    const handleSave = async () => {
        try {
            setError('')
            await updateUser(username, avatar, bio)
            onClose()
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error)
            } else {
                setError('An error occurred while updating the profile')
            }
            console.error('Error updating user profile:', error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier le profil</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Nom d'utilisateur
                        </Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="avatar" className="text-right">
                            URL de l'avatar
                        </Label>
                        <Input
                            id="avatar"
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bio" className="text-right">
                            Bio
                        </Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Enregistrer les modifications</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

