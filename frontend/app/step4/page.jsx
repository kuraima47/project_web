"use client";
import { useContext, useState } from 'react';
import { QuestContext } from '../../contexts/QuestContext';
import { useRouter } from 'next/navigation';
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
import Ripple from "../ripple.png";
import Image from "next/image";

export default function Step4() {
    const { currentStep, completeStep } = useContext(QuestContext);
    const [code, setCode] = useState('');
    const [feedback, setFeedback] = useState('');
    const [validated, setValidated] = useState(false);
    const router = useRouter();

    function handleSubmit(e) {
        e.preventDefault();
        if (currentStep === 3) {
            // Admettons que le message caché soit "secret-png-message"
            if (code.trim().toLowerCase() === 'secret-png-message') {
                completeStep(3);
                setFeedback('Étape #4 validée !');
                setValidated(true);
            } else {
                setFeedback('Ce code est incorrect...');
            }
        }else if (currentStep > 3) {
            setValidated(true);
        }
    }

    if (currentStep < 3) {
        return (
            <div style={{ padding: '2rem' }}>
                <h2 className="text-4xl font-extrabold dark:text-white">Étape #4 inaccessible</h2>
                <p>Valide d’abord l’étape #3.</p>
            </div>
        );
    }

    function goToStep5() {
        router.push('/step5');
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-4xl font-extrabold dark:text-white">Étape #4 : Image à analyser</h1>
            <p>
                Télécharge et ouvre le fichier.
                Tente d’y trouver des métadonnées cachées (exif, commentaire, ou stéganographie basique).
            </p>
            <Image src={Ripple} alt="Image secrète" style={{ maxWidth: '100%' }} />
            <p>
                Quand tu as trouvé le message secret, entre-le ci-dessous.
            </p>

            {!validated ? (<form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder="Message caché..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={currentStep > 3}
                />
                <Button type="submit" disabled={currentStep > 3}>
                    Valider l’étape #4
                </Button>
            </form>
                ):(
                <>
                    {feedback && <p style={{color: 'green'}}>{feedback}</p>}
                    <Button onClick={goToStep5} style={{marginLeft: '1rem'}}>
                        Continuer vers l'étape #5
                    </Button>
                </>
            )}


        </div>
    );
}
