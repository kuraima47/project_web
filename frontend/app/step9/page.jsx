"use client";
import { useContext, useState } from 'react';
import { QuestContext } from '../../contexts/QuestContext';
import { useRouter } from 'next/navigation';
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";

export default function Step9() {
    const { currentStep, completeStep, FINAL_PASSWORD } = useContext(QuestContext);
    const [decoded, setDecoded] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const [validated, setValidated] = useState(false);

    // On imagine un gros blob encodé :
    //   base64("48656c6c6f2c20766f69637572206c65206d61737465722021") => etc.
    const bigBlob = `aGVsbG8tbWFzdGVy`;

    // (C'est un exemple fictif, tu peux y mettre un vrai message crypté plus long.)
    // L'utilisateur doit détecter qu'il y a un bug d'encodage, ou un "double" base64
    // ou un mélange de caractères accentués...

    function handleValidate() {
        if (currentStep === 8) {
            // Admettons qu'après un vrai décryptage, la réponse attendue est "hello-master"
            if (decoded.trim().toLowerCase() === 'hello-master') {
                completeStep(8);
                setMessage(
                    `Bravo, tu as validé l'étape #9 ! Le mot de passe final est : ${FINAL_PASSWORD}`
                );
                setValidated(true);
            } else {
                setMessage('Non, ce n’est pas la bonne chaîne décryptée...');
            }
        }else if(currentStep > 8) {
            setValidated(true);
        }
    }

    if (currentStep < 8) {
        return (
            <div style={{ padding: '2rem' }}>
                <h2 className="text-4xl font-extrabold dark:text-white">Étape #9 inaccessible</h2>
                <p>Valide d’abord les étapes précédentes.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-4xl font-extrabold dark:text-white">Étape #9 : Puzzle final</h1>
            <p>
                <strong>Voici un blob à décrypter :</strong>
                <br />
                <code style={{ background: '#eee' }}>{bigBlob}</code>
            </p>
            <p>(Il se peut que ce soit une double-encode, ou un mix base64 + hex...)</p>
            {!validated ? (
                <>
                    <Input
                    type="text"
                    placeholder="Ce que tu obtiens après décryptage..."
                    value={decoded}
                    onChange={(e) => setDecoded(e.target.value)}
                    />
                    <Button onClick={handleValidate} disabled={currentStep > 8}>
                        Valider l’étape #9
                    </Button>
                </>):(
                <>
                {message && <p style={{color: 'green'}}>{message}</p>}
                <Button onClick={() => router.push('/')}>
                    Retour à l'accueil
                </Button>
                </>
            )}



            {currentStep === 9 && (
                <p style={{ color: 'green' }}>
                    Va sur la page d’accueil, et trouve ou on entre le mot de passe final !
                </p>
            )}
        </div>
    );
}
