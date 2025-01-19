// contexts/QuestContext.js
"use client";
import { createContext, useState, useEffect } from 'react';

// Nombre total d'easter eggs
const TOTAL_STEPS = 9;
// Par exemple, dernier Easter Egg donne un mot de passe improbable
const FINAL_PASSWORD = 'p4ssw0rd_L0C4L_d3V';

export const QuestContext = createContext();

export function QuestProvider({ children }) {
    const [currentStep, setCurrentStep] = useState(0);

    // Charger la progression depuis localStorage au montage
    useEffect(() => {
        const savedStep = localStorage.getItem('questStep');
        if (savedStep) {
            setCurrentStep(Number(savedStep));
        }
    }, []);

    // Sauvegarder la progression à chaque changement
    useEffect(() => {
        localStorage.setItem('questStep', currentStep);
    }, [currentStep]);

    // Fonction pour marquer l'étape courante comme réussie et passer à la suivante
    function completeStep(stepNumber) {
        // Ne permet de passer à l'étape suivante que si la bonne étape est validée dans l'ordre
        if (stepNumber === currentStep) {
            setCurrentStep((prev) => prev + 1);
        }
    }

    return (
        <QuestContext.Provider
            value={{
                currentStep,
                completeStep,
                TOTAL_STEPS,
                FINAL_PASSWORD,
            }}
        >
            {children}
        </QuestContext.Provider>
    );
}
