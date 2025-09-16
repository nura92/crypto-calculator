import React, { useState } from "react";
import Header from "./components/Header";
import PricePanel from "./components/PricePanel";
import ArbitrageCalculator from "./components/ArbitrageCalculator";
import MarginCalculator from "./components/MarginCalculator";

const App = () => {
  const [symbol, setSymbol] = useState("BTC");
  const [livePrices, setLivePrices] = useState(null);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <div className="mb-4 flex gap-2">
          <input
            className="border p-2 rounded flex-1"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Symbol (e.g., BTC)"
          />
        </div>

        <div className="grid gap-4">
          <PricePanel symbol={symbol} onPrices={(p)=>setLivePrices(p)} />
          <ArbitrageCalculator livePrices={livePrices} />
          <MarginCalculator />
        </div>

        <footer className="text-xs text-gray-500 mt-6 text-center">
          Live prices come from public exchange APIs (some may return N/A due to CORS or pair naming differences).
        </footer>
      </div>
    </div>
  );
};

export default App;
