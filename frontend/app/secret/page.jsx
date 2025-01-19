"use client";
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestContext } from '../../contexts/QuestContext';
import {Button} from "../../components/ui/button";

export default function Secret() {
    const router = useRouter();
    const { currentStep, completeStep } = useContext(QuestContext);
    const [validated, setValidated] = useState(false);

    function handleValidateSecretStep() {
        if (currentStep === 1) {
            completeStep(1); // On passe à currentStep=2
            alert('Étape #2 validée ! Code pour la suite : "42"');
            setValidated(true);
        }else if (currentStep > 1) {
            setValidated(true);
        } else {
            alert("Tu n'es pas encore à l'étape appropriée, ou tu l'as déjà validée.");
        }
    }

    function goToStep3() {
        router.push('/step3');
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <h1 className="text-4xl font-extrabold dark:text-white">Page Secrète - Easter Egg #2</h1>
            <p>Bravo, tu as réussi le Konami Code !</p>
            <p>Ton indice pour la suite est : <strong>42</strong></p>

            {/* Bouton de validation de l'étape #2 */}
            {currentStep === 1 && !validated && (
                <Button onClick={handleValidateSecretStep}>
                    Valider l'Easter Egg #2
                </Button>
            )}

            {/* Bouton pour passer à l'étape #3,
          visible uniquement si l'étape #2 est validée (currentStep >= 2). */}
            {currentStep >= 2 && (
                <Button onClick={goToStep3} style={{ marginLeft: '1rem' }}>
                    Continuer vers l'étape #3
                </Button>
            )}
        </div>
    );
}
