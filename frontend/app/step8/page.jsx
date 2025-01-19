"use client";
import { useContext, useState, useEffect } from 'react';
import { QuestContext } from '../../contexts/QuestContext';
import { useRouter } from 'next/navigation';
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";

export default function Step8() {
    const { currentStep, completeStep } = useContext(QuestContext);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const router = useRouter();
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (currentStep === 7) {
            // On place un cookie "x-easter-egg=chocoCookie987"
            document.cookie = 'x-easter-egg=chocoCookie987; path=/;';
            // (En vrai, on pourrait le faire server-side, ou via un set-cookie).
            console.log(
                '%cUn cookie a été déposé... À toi de le trouver !',
                'color: magenta; font-weight: bold;'
            );
        }
    }, [currentStep]);

    function handleSubmit(e) {
        e.preventDefault();
        if (currentStep === 7) {
            if (answer.trim().toLowerCase() === 'chococookie987') {
                completeStep(7);
                setFeedback('Étape #8 validée !');
                setValidated(true);
            } else {
                setFeedback('Incorrect !');
            }
        }else if (currentStep > 7) {
            setValidated(true);
        }
    }

    if (currentStep < 7) {
        return (
            <div style={{ padding: '2rem' }}>
                <h2 className="text-4xl font-extrabold dark:text-white">Étape #8 inaccessible</h2>
                <p>Valide d’abord les étapes précédentes.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="text-4xl font-extrabold dark:text-white">Étape #8 : Lecture de cookie</h1>
            <p>
                Un cookie a été déposé au chargement de la page. Va explorer
                la DevTools &gt; onglet Application &gt; Cookies, et récupère sa valeur.
            </p>
            {!validated ? (<form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder="Valeur du cookie..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />
                <Button type="submit">Valider l’étape #8</Button>
            </form>):(
                <>
                    <p style={{color: 'green'}}>{feedback}</p>
                    <Button onClick={() => router.push('/step9')}>
                        Continuer vers l'étape #9
                    </Button>
                </>
                )}
        </div>
    );
}
