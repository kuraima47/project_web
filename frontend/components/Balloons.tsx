// components/Balloons.jsx
"use client";

import { useEffect, useState } from 'react';
import styles from './Balloon.module.css';

export function Balloons() {
    const [balloons, setBalloons] = useState([]);

    useEffect(() => {
        const balloonCount = 50; // Nombre de ballons
        const newBalloons = Array.from({ length: balloonCount }).map((_, index) => ({
            id: index,
            left: Math.random() * 100, // Position horizontale aléatoire (%)
            delay: Math.random() * 5,   // Délai aléatoire avant le début de l'animation (s)
            size: Math.random() * 40 + 30, // Taille aléatoire (px), augmentée pour des ballons plus visibles
            duration: Math.random() * 20 + 5, // Durée de l'animation (s)
            color: `hsl(${Math.random() * 360}, 70%, 60%)`, // Couleur aléatoire
        }));
        setBalloons(newBalloons);
    }, []);

    return (
        <div className={styles.balloonsContainer}>
            {balloons.map((balloon) => (
                <div
                    key={balloon.id}
                    className={styles.balloon}
                    style={{
                        left: `${balloon.left}%`,
                        animationDelay: `${balloon.delay}s`,
                        animationDuration: `${balloon.duration}s`,
                        backgroundColor: balloon.color,
                        width: `${balloon.size}px`,
                        height: `${balloon.size * 1.2}px`,
                    }}
                >
                    {/* Optionnel : ajouter un nœud fil */}
                    <div className={styles.string}></div>
                </div>
            ))}
        </div>
    );
}
