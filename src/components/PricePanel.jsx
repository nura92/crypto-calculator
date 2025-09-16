import React, { useEffect, useState } from "react";
import { fetchAllPrices } from "../Services/exchanges.js";

const PricePanel = ({ symbol, onPrices }) => {
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchAllPrices(symbol);
    setPrices(data);
    setLoading(false);
    if (onPrices) onPrices(data);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000); // refresh every 15s
    return () => clearInterval(id);
  }, [symbol]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Live Prices — {symbol.toUpperCase()}</h2>
          <p className="text-xs text-gray-500">Auto-refresh every 15s</p>
        </div>
        <div>
          <button onClick={load} className="text-sm px-3 py-1 bg-blue-500 text-white rounded">Refresh</button>
        </div>
      </div>

      {loading && <p className="mt-3 text-sm text-gray-600">Fetching prices…</p>}

      {prices && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 text-sm">
          {["binance","coinbase","kraken","bitstamp","kucoin"].map((ex) => (
            <div key={ex} className="p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">{ex}</div>
              <div className="font-medium">
                {prices[ex] ? `$${prices[ex].toFixed(2)}` : <span className="text-red-500">N/A</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <p className="text-xs text-gray-400 mt-2">If you get CORS errors, see the readme notes below.</p>
    </div>
  );
};

export default PricePanel;
