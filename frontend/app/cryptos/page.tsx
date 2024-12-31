"use client";

import { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2"; // Utilisation de Scatter pour le nuage de points
import "chart.js/auto";

export default function Cryptos() {
  const [cryptoData, setCryptoData] = useState([]);
  const [cryptoList, setCryptoList] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPrices, setCurrentPrices] = useState([]);

  // Fonction pour charger les données des cryptos disponibles
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/cryptos");
        const data = await response.json();
        setCryptoList(data.data || []);
        setLoading(false);

        // Récupérer les prix actuels des cryptos et trier par ordre croissant
        const prices = data.data.map(crypto => ({
          name: crypto.name,
          price: crypto.quote.USD.price,
        }));

        // Trier par prix croissant
        prices.sort((a, b) => b.price - a.price);

        setCurrentPrices(prices);
      } catch (error) {
        console.error("Error fetching crypto list:", error);
        setLoading(false);
      }
    };
    fetchCryptos();
  }, []);

  // Fonction pour charger les données de prix de la crypto sélectionnée
  const fetchCryptoData = async (cryptoName) => {
    try {
      const response = await fetch(`http://localhost:3001/api/cryptos/${cryptoName}`);
      const data = await response.json();
      setCryptoData(data.data || []);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
  };

  // Met à jour le graphique lorsque l'utilisateur sélectionne une crypto
  const handleCryptoSelect = (e) => {
    const selectedName = e.target.value;
    setSelectedCrypto(selectedName);
    fetchCryptoData(selectedName);
  };

  // Préparation des données pour le nuage de points (Scatter plot)
  const scatterData = {
    datasets: [
      {
        label: "Prix actuel des cryptos",
        data: currentPrices.map((crypto, index) => ({
          x: index + 1, // Utilisation d'un index pour la position sur l'axe des X
          y: crypto.price, // Prix sur l'axe des Y
          cryptoName: crypto.name, // Ajouter le nom de la crypto pour l'utiliser dans le tooltip
        })),
        backgroundColor: "rgba(75, 192, 192, 1)",
        borderColor: "rgba(75, 192, 192, 1)",
        showLine: false,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category", // L'axe X est de type "catégorie" pour afficher les cryptos
        labels: currentPrices.map((crypto) => crypto.name), // Noms des cryptos
        title: {
          display: true,
          text: "Cryptos",
        },
        grid: {
          offset: true,
        },
        ticks: {
          maxRotation: 90,
          minRotation: 45,
        },
      },
      y: {
        type: "logarithmic", // Echelle logarithmique
        min: 1, // Commence à 1 pour éviter les problèmes avec les valeurs très faibles
        title: {
          display: true,
          text: "Prix en USD",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const { cryptoName, y } = tooltipItem.raw;
            return `${cryptoName}: $${y.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Analyser une crypto</h1>

      {/* Champ de sélection avec auto-complétion */}
      <div className="mb-4">
        <input
          type="text"
          list="crypto-list"
          placeholder="Rechercher une crypto"
          onChange={handleCryptoSelect}
          className="border p-2 rounded"
        />
        <datalist id="crypto-list">
          {cryptoList.map((crypto) => (
            <option key={crypto.id} value={crypto.name} />
          ))}
        </datalist>
      </div>

      {/* Affichage du graphique sélectionné */}
      {loading ? (
        <p>Chargement...</p>
      ) : selectedCrypto ? (
        <div style={{ height: "400px", width: "100%" }}>
          {/* Remplacer le graphique par un nuage de points */}
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      ) : (
        <p>Veuillez sélectionner une crypto pour afficher son graphique.</p>
      )}

      <div
        style={{
          height: "400px", 
          width: "100%",
          marginTop: "20px",
          overflowX: "auto", // Permet le scroll horizontal
          overflowY: "hidden",
        }}
      >

    <h1 className="text-2xl font-bold">Nuage de Points des Prix des Cryptos</h1>
        <div style={{ height: "400px", width: `${currentPrices.length * 50}px`, display: "flex" }}>
          {/* Affichage des points du nuage pour chaque crypto */}
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      </div>
    </div>
  );
}
