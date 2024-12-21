import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CommentModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (content: string) => void
}

export function CommentModal({ isOpen, onClose, onSubmit }: CommentModalProps) {
    const [comment, setComment] = useState('')

    const handleSubmit = () => {
        onSubmit(comment)
        setComment('')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un commentaire</DialogTitle>
                </DialogHeader>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Écrivez votre commentaire ici..."
                    className="min-h-[100px]"
                />
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Publier</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

