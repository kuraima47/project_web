"use client";
import { useContext, useState } from 'react';
import { QuestContext } from '../../contexts/QuestContext';
import { useRouter } from 'next/navigation';
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
// On laisse un commentaire "/* code-lost-omega */" :
/*
  => Indice : code-lost-omega
*/
export default function Step6() {
    const { currentStep, completeStep } = useContext(QuestContext);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [validated, setValidated] = useState(false);
    const router = useRouter();

    function handleValidate(e) {
        e.preventDefault();
        if (currentStep === 5) {
            // Attendu : "code-lost-omega"
            if (input.trim().toLowerCase() === 'code-lost-omega') {
                completeStep(5);
                setFeedback('Étape #6 validée !');
                setValidated(true);
            } else {
                setFeedback("Mauvaise réponse...");
            }
        }else if (currentStep > 5) {
            setValidated(true);
        }
    }

    if (currentStep < 5) {
        return (
            <div style={{ padding: '2rem' }}>
                <h2 className="text-4xl font-extrabold dark:text-white">Étape #6 inaccessible</h2>
                <p>Valide d’abord les étapes précédentes.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-4xl font-extrabold dark:text-white">Étape #6 : Commentaire caché dans le code source</h1>
            <p>
                Un commentaire se cache dans le code de cette page.
                Peut-être sera-t-il visible uniquement dans le repo
                ou en fouillant le code transpilé...
            </p>
            {!validated ? (<form onSubmit={handleValidate}>
                <Input
                    type="text"
                    placeholder="Message du commentaire..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit">Valider l’étape #6</Button>
            </form>) : (
                <>
                    <p style={{color: 'green'}}>{feedback}</p>
                    <Button onClick={() => router.push('/step7')}>
                        Continuer vers l'étape #7
                    </Button>
                </>
            )}
        </div>
    );
}
