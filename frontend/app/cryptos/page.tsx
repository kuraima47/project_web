"use client";

import { useEffect, useState } from "react";
import { Line, Scatter } from "react-chartjs-2"; // Utilisation de Line pour le graphique de ligne
import "chart.js/auto";
import { getApiUrl } from "@/utils/address";
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Ajout d'un nouveau type pour les données historiques
interface SparklineData {
  [key: string]: number[];
}

export default function Cryptos() {
  const [cryptoData, setCryptoData] = useState([]);  // Contient les données historiques de la crypto
  const [cryptoList, setCryptoList] = useState([]);  // Liste des cryptos disponibles
  const [selectedCrypto, setSelectedCrypto] = useState(null);  // Crypto sélectionnée
  const [loading, setLoading] = useState(true);  // Indicateur de chargement
  const [historicalPrices, setHistoricalPrices] = useState([]); // Historique des prix
  const [currentPrices, setCurrentPrices] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap', direction: 'desc' });
  const [sparklineData, setSparklineData] = useState<SparklineData>({});
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Fonction pour charger les données des cryptos disponibles
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch(getApiUrl("/api/cryptos"));
        const data = await response.json();
        
        const formattedData = data.data.map(crypto => ({
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
          price: crypto.quote.USD.price,
          percent_change_1h: crypto.quote.USD.percent_change_1h,
          percent_change_24h: crypto.quote.USD.percent_change_24h,
        }));

        setCryptoData(formattedData);

        // Récupération des données historiques pour les sparklines
        const sparklines = {};
        for (const crypto of data.data) {
          try {
            const historyResponse = await fetch(getApiUrl(`/api/cryptos/${crypto.id}/sparkline`));
            const historyData = await historyResponse.json();
            console.log(`Sparkline data for ${crypto.id}:`, historyData); // Debug log
            sparklines[crypto.id] = historyData.prices || historyData; // Gestion plus flexible de la réponse
          } catch (error) {
            console.error(`Error fetching sparkline for ${crypto.id}:`, error);
            sparklines[crypto.id] = [];
          }
        }
        console.log('All sparkline data:', sparklines); // Debug log
        setSparklineData(sparklines);
        setLoading(false);
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
      const response = await fetch(getApiUrl(`/api/cryptos/${cryptoName}`));
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
        borderColor: "rgb(76, 76, 76)",
        backgroundColor: "rgba(21, 21, 21, 0.2)",
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
        backgroundColor: "rgba(21, 21, 21, 0.2)",
        borderColor: "rgb(84, 84, 84)",
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

  // Fonction de tri
  const sortData = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Composant pour le mini graphique
  const Sparkline = ({ data, positive }) => {
    console.log('Sparkline received data:', data); // Debug log

    if (!data || data.length === 0) {
      console.log('No data for sparkline'); // Debug log
      return <div className="w-[120px] h-[40px] bg-gray-100 dark:bg-gray-700" />;
    }

    const height = 40;
    const width = 120;
    const points = data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Éviter la division par zéro

    const points_string = data.map((value, index) => {
      const x = (index / (points - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="sparkline">
        <polyline
          points={points_string}
          fill="none"
          stroke={positive ? "#16a34a" : "#dc2626"}
          strokeWidth="1.5"
        />
        {/* Ajout d'un point pour le dernier prix */}
        <circle
          cx={(points - 1) * (width / (points - 1))}
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r="2"
          fill={positive ? "#16a34a" : "#dc2626"}
        />
      </svg>
    );
  };

  // Fonction de filtrage des cryptos
  const filteredCryptos = cryptoData.filter(crypto => 
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Marché des Cryptomonnaies</h1>
      
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Rechercher une crypto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-right cursor-pointer" onClick={() => sortData('price')}>
                Prix
              </th>
              <th className="px-4 py-3 text-right cursor-pointer" onClick={() => sortData('percent_change_1h')}>
                1h %
              </th>
              <th className="px-4 py-3 text-right cursor-pointer" onClick={() => sortData('percent_change_24h')}>
                24h %
              </th>
              <th className="px-4 py-3">Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {filteredCryptos
              .sort((a, b) => {
                if (sortConfig.direction === 'asc') {
                  return a[sortConfig.key] - b[sortConfig.key];
                }
                return b[sortConfig.key] - a[sortConfig.key];
              })
              .map((crypto, index) => (
                <tr 
                  key={crypto.id} 
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => router.push(`/cryptos/${crypto.id}`)}
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span className="font-medium">{crypto.name}</span>
                    <span className="text-gray-500">{crypto.symbol}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`px-4 py-3 text-right ${crypto.percent_change_1h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {crypto.percent_change_1h.toFixed(2)}%
                  </td>
                  <td className={`px-4 py-3 text-right ${crypto.percent_change_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {crypto.percent_change_24h.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">
                    {sparklineData[crypto.id] ? (
                      <Sparkline 
                        data={sparklineData[crypto.id]} 
                        positive={crypto.percent_change_24h > 0}
                      />
                    ) : (
                      <div className="w-[120px] h-[40px] bg-gray-100 dark:bg-gray-700" />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}