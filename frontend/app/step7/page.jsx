"use client";
import { useContext, useEffect, useState } from 'react';
import { QuestContext } from '../../contexts/QuestContext';
import { useRouter } from 'next/navigation';
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";

export default function Step7() {
    const { currentStep, completeStep } = useContext(QuestContext);
    const [code, setCode] = useState('');
    const [feedback, setFeedback] = useState('');
    const router = useRouter();
    const [validated, setValidated] = useState(false);

    function loopTimeout(){
        setTimeout(() => {
            console.log("event");
            const event = new CustomEvent('super-clue', {
                detail: 'delta-event-777',
            });
            window.dispatchEvent(event);
            loopTimeout();
        }, 5000);
    }

    useEffect(() => {
        if (currentStep === 6) {
            loopTimeout();
        }
    }, [currentStep]);

    function handleSubmit(e) {
        e.preventDefault();
        if (currentStep === 6) {
            if (code.trim().toLowerCase() === 'delta-event-777') {
                completeStep(6);
                setFeedback('Étape #7 validée !');
                setValidated(true);
            } else {
                setFeedback('Ce n’est pas la bonne valeur...');
            }
        }else if (currentStep > 6) {
            setValidated(true);
        }
    }

    if (currentStep < 6) {
        return (
            <div style={{ padding: '2rem' }}>
                <h2 className="text-4xl font-extrabold dark:text-white">Étape #7 inaccessible</h2>
                <p>Valide d’abord les étapes précédentes.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-4xl font-extrabold dark:text-white">Étape #7 : Événement custom</h1>
            <p>
                Un événement personnalisé est émis dans <code>window</code>
                lorsque tu charges cette page. À toi de l’écouter
                pour en extraire la <code>detail</code>.
            </p>

            {!validated ? (<form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder="Valeur du detail de l'event"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <Button type="submit">Valider l’étape #7</Button>
            </form>):(
                <>
                    <p style={{color: 'green'}}>{feedback}</p>
                    <Button onClick={() => router.push('/step8')}>
                        Continuer vers l'étape #8
                    </Button>
                </>
                )}
        </div>
    );
}
