"use client";

import { useEffect, useState } from "react";
import { Line, Scatter } from "react-chartjs-2"; // Utilisation de Line pour le graphique de ligne
import "chart.js/auto";
import { getApiUrl } from "@/utils/address";

export default function Cryptos() {
  const [cryptoData, setCryptoData] = useState([]);  // Contient les données historiques de la crypto
  const [cryptoList, setCryptoList] = useState([]);  // Liste des cryptos disponibles
  const [selectedCrypto, setSelectedCrypto] = useState(null);  // Crypto sélectionnée
  const [loading, setLoading] = useState(true);  // Indicateur de chargement
  const [historicalPrices, setHistoricalPrices] = useState([]); // Historique des prix
  const [currentPrices, setCurrentPrices] = useState([]);

  // Fonction pour charger les données des cryptos disponibles
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch(getApiUrl("/api/cryptos"));
        const data = await response.json();

        setCryptoList(data.data || []);
        setLoading(false);

        const prices = data.data.map(crypto => ({
          name: crypto.name,
          price: crypto.quote.USD.price,
        }));

        prices.sort((a, b) => b.price - a.price);

        setCurrentPrices(prices);

      } catch (error) {
        console.error("Error fetching crypto list:", error);
        setLoading(false);
      }
    };
    fetchCryptos();
  }, []);

  // Fonction pour charger les données de prix historiques de la crypto sélectionnée
  const fetchCryptoData = async (cryptoName) => {
    try {
      const response = await fetch(getApiUrl(`/cryptos/${cryptoName}`));
      const data = await response.json();
      setCryptoData(data || []);
      console.log(data);

      // Préparation des données historiques pour le graphique
      const historical = data.map((entry) => ({
        time: new Date(entry.last_updated).toLocaleString(), // Format de la date
        price: entry.quote.USD.price,
      }));

      setHistoricalPrices(historical);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
  };

  // Met à jour les données lorsque l'utilisateur sélectionne une crypto
  const handleCryptoSelect = (e) => {
    const selectedName = e.target.value;
    setSelectedCrypto(selectedName);
    fetchCryptoData(selectedName);
  };

  // Fonction pour obtenir les valeurs min et max des prix historiques
  const getMinMax = (data) => {
    const prices = data.map(entry => entry.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max };
  };

  const { min, max } = getMinMax(historicalPrices);

  // Préparation des données pour le graphique
  const lineData = {
    labels: historicalPrices.map((data) => data.time), // Étiquettes (temps)
    datasets: [
      {
        label: selectedCrypto ? `${selectedCrypto} - Prix en USD` : "Prix en USD",
        data: historicalPrices.map((data) => data.price), // Données des prix
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4, // Courbe douce
      },
    ],
  };

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
        min: 1,
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

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category", // Type de l'axe X pour afficher les dates
        title: {
          display: true,
          text: "Temps",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Prix en USD",
        },
        min: Math.max(0, min * 0.999), // Limite inférieure avec un buffer de 1% sous le min
        max: max * 1.001, // Limite supérieure avec un buffer de 1% au-dessus du max
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const { xLabel, raw } = tooltipItem;
            return `Date: ${xLabel}, Prix: $${raw.toFixed(2)}`;
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

      {/* Affichage du graphique si crypto est sélectionnée */}
      {loading ? (
        <p>Chargement...</p>
      ) : selectedCrypto ? (
        <div style={{ height: "400px", width: "100%" }}>
          {/* Affichage du graphique avec les prix historiques */}
          <Line data={lineData} options={lineOptions} />
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
