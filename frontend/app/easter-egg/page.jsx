"use client";

import {useCallback, useContext, useEffect, useState} from 'react';
import { QuestContext } from '../../contexts/QuestContext';
import Image from 'next/image';
import Balloons from '../../components/Balloons';
import {useRouter} from 'next/navigation';
import {Button} from "../../components/ui/button";

export default function EasterEgg() {

    const { currentStep, completeStep, TOTAL_STEPS } = useContext(QuestContext);

    const konamiSequence = [
        'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
        'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
        'b','a',
    ];
    let konamiIndex = 0;

    const router = useRouter();

    const handleKeyDown = useCallback((e) => {
        console.log(e.key);
        if (e.key === konamiSequence[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiSequence.length) {
                router.push('/secret');
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    }, [router]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    function handleValidateFirstStep() {
        if (currentStep === 0) {
            completeStep(0);
            alert('Étape #1 validée. À toi de trouver le Konami code pour la suite !');
        } else {
            alert('Soit tu as déjà validé cette étape, soit tu n’es pas au bon moment ;)');
        }
    }
    console.log("currentStep :", currentStep);
    return (
        <>
            <main style={{ padding: '2rem', textAlign: 'center' }}>
                <h1 className="text-4xl font-extrabold dark:text-white">Page d’easter Egg</h1>

                <p>
                    Bienvenue dans cette quête d’Easter Eggs !
                    {currentStep === 0 && <em>(Cherche un indice dans le code HTML...)</em>}
                </p>

                {currentStep === 0 && (
                    <Button onClick={handleValidateFirstStep}>
                        Démarer la chasse aux easters eggs
                    </Button>
                )}
            </main>
        </>
    );
}

