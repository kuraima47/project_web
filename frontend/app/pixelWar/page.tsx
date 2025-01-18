"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker"; // Un composant personnalisé pour choisir la couleur
import { io } from "socket.io-client";

import { getApiUrl } from "@/utils/address";
import { getWsPixelWarUrl, getWsPixelWarPath } from "@/utils/address";

const GridSize = 60; // 100x100 cases
const PixelSize = 30; // Taille de chaque pixel (20x20px)

export default function PixelWar() {
  const { user } = useAuth();
  const [color, setColor] = useState("#000000"); // Couleur par défaut
  const [pixels, setPixels] = useState([]); // Pixels à afficher
  const [isZoomed, setIsZoomed] = useState(false);

  const path = getWsPixelWarPath();
  useEffect(() => {
    // Charger les pixels du backend (via API)
    const socket = io(getWsPixelWarUrl(), {
      query: {
        token: localStorage.getItem("token"),
      },
      path: path
    });

    // Recevoir les notifications en temps réel via WebSocket
    socket.on("newPixel", (data) => {
      const { x, y, color, userId } = data;
      placePixelFront(x, y, color);
    });

    // Cleanup du socket à la déconnexion du composant
    const fetchPixels = async () => {
      try {
        const response = await fetch(getApiUrl("/api/pixels"), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();

        // Vérifie si les données sont bien un tableau
        if (Array.isArray(data)) {
          setPixels(data);
        } else {
          console.error("Les données retournées ne sont pas un tableau", data);
        }
      } catch (error) {
        console.error("Erreur de chargement des pixels:", error);
      }
    };
    fetchPixels();

    return () => {
      socket.off("receiveNotification");
      socket.disconnect();
    };

  }, []);

  // Fonction pour gérer le placement des pixels

  const placePixelFront = async (x, y, color) => {
    const newPixel = { x, y, color };
    setPixels((prevPixels) => {
      // Vérifier si un pixel avec les mêmes coordonnées existe déjà
      const pixelIndex = prevPixels.findIndex((pixel) => pixel.x === x && pixel.y === y);
  
      if (pixelIndex !== -1) {
        // Si le pixel existe, remplacer son color
        const updatedPixels = [...prevPixels];
        updatedPixels[pixelIndex] = newPixel;
        return updatedPixels;
      } else {
        // Sinon, ajouter le nouveau pixel
        return [...prevPixels, newPixel];
      }
    });
  };

  const handlePlacePixel = async (x, y) => {
    if (!user) return;

    const newPixel = { x, y, color };

    try {
      const response = await fetch(getApiUrl("/api/pixels"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newPixel),
      });

      if (response.ok) {
        setPixels((prevPixels) => [...prevPixels, newPixel]);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error("Erreur lors de la pose du pixel:", error);
    }
  };

  // Fonction pour gérer le zoom
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const renderGrid = () => {
    const grid = [];
    for (let i = 0; i < GridSize; i++) {
      for (let j = 0; j < GridSize; j++) {
        // Utiliser `find` en toute sécurité, avec une vérification que `pixels` est bien un tableau
        const pixel = Array.isArray(pixels)
          ? pixels.find((p) => p.x === i && p.y === j)
          : null;
        const color = pixel ? pixel.color : "#FFFFFF"; // Blanc par défaut si pas de pixel
        grid.push(
          <div
            key={`${i}-${j}`}
            onClick={() => handlePlacePixel(i, j)}
            style={{
              width: PixelSize + "px",
              height: PixelSize + "px",
              backgroundColor: color,
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          ></div>
        );
      }
    }
    return grid;
  };

  return (
    <div className="flex-col items-center" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh" }}>
      <div className="mb-4">
        <ColorPicker color={color} setColor={setColor} /> {/* Palette de couleurs */}
      </div>

      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GridSize}, 15px)`,
          gridTemplateRows: `repeat(${GridSize}, 15px)`,
          overflow: "hidden", 
          maxWidth: "100vw", 
          maxHeight: "100vh", 
          border: 10,
        }}
      >
        {renderGrid()}
      </div>
    </div>
  );
}
