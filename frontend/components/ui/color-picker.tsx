// components/ui/color-picker.js
"use client";

import { useState } from "react";

export function ColorPicker({ color, setColor }) {
  const [open, setOpen] = useState(false);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        style={{ backgroundColor: color }}
        className="w-12 h-12 rounded-full border-2 border-gray-300"
        onClick={() => setOpen(!open)}
      ></button>

      {open && (
        <div className="absolute top-0 left-0 bg-white border border-gray-300 p-2 shadow-md rounded-md">
          <div className="flex">
            {["#000000","#865840","#f44336","#e81e63","#9c27b0","#673ab7","#3f51b5","#2196f3","#03a9f4","#00bcd4","#8bc34a","#cddc39","#ffeb3b","#ffc107","#ff9800","#ff5722","#ffffff"]
.map((col) => (
              <div
                key={col}
                onClick={() => handleColorChange(col)}
                style={{ backgroundColor: col }}
                className="w-8 h-8 cursor-pointer rounded-full border-2 border-gray-300"
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
