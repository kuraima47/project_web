// components/ui/color-picker.js
"use client";

import { useState } from "react";

export function ColorPicker({ color, setColor }) {
  const [open, setOpen] = useState(false);

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setColor(newColor);
  };

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Bouton principal pour ouvrir/fermer le sélecteur */}
      <button
        style={{ backgroundColor: color }}
        className="w-12 h-12 rounded-full border-2 border-gray-300"
        onClick={() => setOpen(!open)}
      ></button>

      {/* Modale de sélection */}
      {open && (
        <div
          className="absolute top-0 left-0 bg-white border border-gray-300 p-4 shadow-md rounded-md"
          onClick={(e) => e.stopPropagation()} // Empêche la propagation du clic
        >
          {/* Input de sélection */}
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-full h-10 cursor-pointer border-none"
          />

          {/* Bouton de fermeture */}
          <button
            onClick={closeModal}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
