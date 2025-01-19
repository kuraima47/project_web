'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getApiUrl } from '@/utils/address';

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      volume_24h: number;
      market_cap: number;
    };
  };
}

export default function CryptoDetail() {
  const params = useParams();
  const router = useRouter();
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoDetail = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/cryptos/${params.id}`));
        if (!response.ok) {
          throw new Error('Failed to fetch crypto data');
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log
        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto details:', error);
        setError('Failed to load crypto data');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error || !cryptoData) {
    return (
      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour
        </button>
        <p className="text-red-500">{error || 'Crypto non trouvée'}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Retour
      </button>

      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold mr-4">{cryptoData.name}</h1>
        <span className="text-gray-500 text-xl">{cryptoData.symbol}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Prix</h2>
          <p className="text-2xl">
            ${cryptoData.quote?.USD?.price?.toLocaleString() ?? 'N/A'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Variation 24h</h2>
          <p className={`text-2xl ${
            (cryptoData.quote?.USD?.percent_change_24h ?? 0) > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {cryptoData.quote?.USD?.percent_change_24h?.toFixed(2) ?? 'N/A'}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Volume 24h</h2>
          <p className="text-2xl">
            ${cryptoData.quote?.USD?.volume_24h?.toLocaleString() ?? 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Market Cap</span>
              <span>${cryptoData.quote?.USD?.market_cap?.toLocaleString() ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Variation 1h</span>
              <span className={
                (cryptoData.quote?.USD?.percent_change_1h ?? 0) > 0 ? 'text-green-500' : 'text-red-500'
              }>
                {cryptoData.quote?.USD?.percent_change_1h?.toFixed(2) ?? 'N/A'}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Variation 7j</span>
              <span className={
                (cryptoData.quote?.USD?.percent_change_7d ?? 0) > 0 ? 'text-green-500' : 'text-red-500'
              }>
                {cryptoData.quote?.USD?.percent_change_7d?.toFixed(2) ?? 'N/A'}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
