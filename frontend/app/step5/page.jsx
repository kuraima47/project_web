"use client";
import { useContext, useState } from 'react';
import { QuestContext } from '../../contexts/QuestContext';
import { useRouter } from 'next/navigation';
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";

export default function Step5() {
    const { currentStep, completeStep } = useContext(QuestContext);
    const [answer, setAnswer] = useState('');
    const [message, setMessage] = useState('');
    const [validated, setValidated] = useState(false);
    const router = useRouter();
    // On récupère la variable d’environnement
    const weirdKey = process.env.NEXT_PUBLIC_WEIRD_KEY;

    function handleSubmit(e) {
        e.preventDefault();
        if (currentStep === 4) {
            // Admettons qu’après décryptage base64 de weirdKey
            // on obtienne "data-super-secrete"
            if (answer.trim().toLowerCase() === 'data-super-secrette') {
                completeStep(4);
                setMessage('Étape #5 validée !');
                setValidated(true);
            } else {
                setMessage('Mauvaise réponse...');
            }
        }else if(currentStep > 4) {
            setValidated(true);
        }else {
            setMessage("Tu n'es pas au bon stade de la quête.");
        }
    }

    if (currentStep < 4) {
        return (
            <div style={{ padding: '2rem' }}>
                <h2 className="text-4xl font-extrabold dark:text-white">Étape #5 inaccessible</h2>
                <p>Valide d’abord les étapes précédentes.</p>
            </div>
        );
    }

    function goToStep6() {
        router.push('/step6');
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-4xl font-extrabold dark:text-white">Étape #5 : Decode base64</h1>
            <p>
                <strong>Valeur brute&nbsp;:</strong> <code>{weirdKey}</code>
            </p>

            {!validated ? (<form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder="Valeur décryptée..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />
                <Button type="submit">Valider l’étape #5</Button>
            </form>
            ) : (
                <>
                    {message && <p style={{color: 'green'}}>{message}</p>}
                    <Button onClick={goToStep6} style={{marginLeft: '1rem'}}>
                        Continuer vers l'étape #6
                    </Button>
                </>
            )}
        </div>
    );
}
