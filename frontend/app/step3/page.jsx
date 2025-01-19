"use client";
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestContext } from '../../contexts/QuestContext';
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
export default function Step3() {
    const { currentStep, completeStep } = useContext(QuestContext);
    const [validated, setValidated] = useState(false);
    const [msg, setMsg] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (currentStep === 2) {
            // On fait une requête pour "le suspense"
            fetch('/api/secret-config')
                .then((res) => res.json())
                .then((data) => {
                    console.log(
                        '%cRegarde la réponse de /api/secret-config dans la Network tab',
                        'color: #1e90ff;'
                    );
                    // Le JSON aura un champ crypté => "68656c6c6f" (hex pour "hello", par ex)
                    // On l'affiche en console pour l'utilisateur
                    console.log('Réponse reçue :', data);
                });
        }else if (currentStep > 2) {
            setValidated(true);
        }
    }, [currentStep]);

    function goToStep4() {
        router.push('/step4');
    }

    // Pour "valider" l'étape, on laisse l’utilisateur taper la valeur décryptée
    function handleValidate(e) {
        e.preventDefault();
        if (currentStep === 2) {
            // Imaginons que la valeur décryptée attendue soit "hello-from-config"
            if (msg.trim().toLowerCase() === 'hello-from-config') {
                completeStep(2); // Valide l’étape #3
                setValidated(true);
            } else {
                alert('Ce n’est pas la bonne chaîne décryptée !');
            }
        }
    }

    if (currentStep < 2) {
        return (
            <div style={{ padding: '2rem' }}>
                <h2>Étape #3 inaccessible</h2>
                <p>Valide d’abord les étapes précédentes.</p>
            </div>
        );
    }
    console.log("Validate : ", validated);
    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-4xl font-extrabold dark:text-white">Étape #3 : Fouille la Network tab</h1>
            <p>
                Au chargement de cette page, une requête a été envoyée vers
                <code>/api/secret-config</code>. Regarde dans ta DevTools / Network tab
                et décrypte la valeur reçue...
            </p>

            {!validated ? (
                <form onSubmit={handleValidate}>
                    <Input
                        type="text"
                        placeholder="Tape la chaîne décryptée"
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                    />
                    <Button type="submit">Valider l’étape #3</Button>
                </form>
            ) : (
                <div>
                    <p style={{color: 'green'}}>
                        Étape #3 validée ! Rendez-vous à l’étape #4...
                    </p>
                    <Button onClick={goToStep4} style={{marginLeft: '1rem'}}>
                        Continuer vers l'étape #4
                    </Button>
                </div>


            )}
        </div>
    );
}
