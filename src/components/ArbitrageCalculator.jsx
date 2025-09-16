import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const calcFees = (buyPrice, sellPrice, qty, buyFeePct, sellFeePct, transferFee) => {
  const buyFee = (buyFeePct / 100) * buyPrice * qty;
  const sellFee = (sellFeePct / 100) * sellPrice * qty;
  const totalFees = buyFee + sellFee + (transferFee || 0);
  const gross = (sellPrice - buyPrice) * qty;
  const net = gross - totalFees;
  return { gross, totalFees, net };
};

const ArbitrageCalculator = ({ livePrices }) => {
  const [quantity, setQuantity] = useState("");
  const [buyFee, setBuyFee] = useState("");
  const [sellFee, setSellFee] = useState("");
  const [transferFee, setTransferFee] = useState("");
  const [manualBuy, setManualBuy] = useState("");
  const [manualSell, setManualSell] = useState("");
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState(null);

  const calculateManual = () => {
    const buy = parseFloat(manualBuy);
    const sell = parseFloat(manualSell);
    if (!buy || !sell) return;
    setResult(calcFees(buy, sell, quantity, buyFee, sellFee, transferFee));
  };

  const calculateCrossExchange = () => {
    if (!livePrices) return;

    const ex = ["binance","coinbase","kraken","bitstamp","kucoin"];
    const labels = [];
    const profits = [];

    for (let i = 0; i < ex.length; i++) {
      for (let j = 0; j < ex.length; j++) {
        if (i === j) continue;
        const a = ex[i], b = ex[j];
        const pa = livePrices[a], pb = livePrices[b];
        if (pa && pb) {
          const r = calcFees(pa, pb, quantity, buyFee, sellFee, transferFee);
          // Only include positive opportunities
          labels.push(`${a}→${b}`);
          profits.push(r.net);
        }
      }
    }

    setChartData({
      labels,
      datasets: [
        {
          label: "Net Profit ($)",
          data: profits,
          backgroundColor: profits.map(p => (p >= 0 ? "green" : "red")),
        },
      ],
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-6">
      <h3 className="font-semibold">Arbitrage Calculator</h3>

      {/* Manual Inputs */}
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div>
          <label className="text-xs">Buy Price (manual)</label>
          <input type="number" value={manualBuy} onChange={(e)=>setManualBuy(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="text-xs">Sell Price (manual)</label>
          <input type="number" value={manualSell} onChange={(e)=>setManualSell(e.target.value)} className="w-full border p-2 rounded" />
        </div>
      </div>

      {/* Fees */}
      <div className="grid sm:grid-cols-3 gap-3 mt-3">
        <input className="border p-2 rounded" type="number" value={quantity} onChange={(e)=>setQuantity(parseFloat(e.target.value))} placeholder="Quantity" />
        <input className="border p-2 rounded" type="number" value={buyFee} onChange={(e)=>setBuyFee(parseFloat(e.target.value))} placeholder="Buy fee %" />
        <input className="border p-2 rounded" type="number" value={sellFee} onChange={(e)=>setSellFee(parseFloat(e.target.value))} placeholder="Sell fee %" />
      </div>

      <div className="mt-3">
        <input className="border p-2 rounded w-full" type="number" value={transferFee} onChange={(e)=>setTransferFee(parseFloat(e.target.value))} placeholder="Transfer fee $" />
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={calculateManual} className="bg-green-500 text-white px-4 py-2 rounded">Calc Manual</button>
        <button onClick={calculateCrossExchange} className="bg-blue-500 text-white px-4 py-2 rounded">Generate Chart</button>
      </div>

      {/* Manual Result */}
      {result && (
        <div className="mt-3 bg-gray-100 p-3 rounded">
          <div><strong>Gross Profit:</strong> ${result.gross.toFixed(2)}</div>
          <div><strong>Total Fees:</strong> ${result.totalFees.toFixed(2)}</div>
          <div><strong>Net Profit:</strong> ${result.net.toFixed(2)}</div>
        </div>
      )}

      {/* Chart */}
      {chartData && (
        <div className="mt-6">
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
        </div>
      )}
    </div>
  );
};

export default ArbitrageCalculator;
