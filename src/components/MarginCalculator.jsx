import React, { useState } from "react";

const MarginCalculator = () => {
  const [entry, setEntry] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [margin, setMargin] = useState("");
  const [leverage, setLeverage] = useState("");
  const [positionType, setPositionType] = useState("long"); // long or short
  const [result, setResult] = useState(null);

  const calculate = () => {
    const e = parseFloat(entry);
    const t = parseFloat(tp);
    const s = parseFloat(sl);
    const m = parseFloat(margin);
    const L = parseFloat(leverage);
    if (!e || !m || !L) return;

    const position = m * L;
    let profit, loss;

    if (positionType === "long") {
      profit = ((t - e) / e) * position;
      loss = ((s - e) / e) * position;
    } else {
      // short position
      profit = ((e - t) / e) * position;
      loss = ((e - s) / e) * position;
    }

    setResult({
      position: position.toFixed(2),
      profit: profit.toFixed(2),
      loss: loss.toFixed(2),
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-6">
      <h3 className="font-semibold">Margin Trading P/L Calculator</h3>

      <div className="grid sm:grid-cols-3 gap-3 mt-3">
        <input className="border p-2 rounded" type="number" placeholder="Entry Price" value={entry} onChange={(e)=>setEntry(e.target.value)} />
        <input className="border p-2 rounded" type="number" placeholder="TP Price" value={tp} onChange={(e)=>setTp(e.target.value)} />
        <input className="border p-2 rounded" type="number" placeholder="SL Price" value={sl} onChange={(e)=>setSl(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <input className="border p-2 rounded" type="number" placeholder="Margin ($)" value={margin} onChange={(e)=>setMargin(e.target.value)} />
        <input className="border p-2 rounded" type="number" placeholder="Leverage (x)" value={leverage} onChange={(e)=>setLeverage(e.target.value)} />
      </div>

      <div className="mt-3">
        <label className="mr-3">
          <input type="radio" name="position" value="long" checked={positionType==="long"} onChange={()=>setPositionType("long")} /> Long
        </label>
        <label>
          <input type="radio" name="position" value="short" checked={positionType==="short"} onChange={()=>setPositionType("short")} /> Short
        </label>
      </div>

      <div className="mt-3">
        <button onClick={calculate} className="bg-blue-600 text-white px-4 py-2 rounded">Calculate</button>
      </div>

      {result && (
        <div className="mt-3 bg-gray-100 p-3 rounded">
          <div><strong>Position Size:</strong> ${result.position}</div>
          <div><strong>Profit if TP hits:</strong> ${result.profit}</div>
          <div><strong>Loss if SL hits:</strong> ${result.loss}</div>
        </div>
      )}
    </div>
  );
};

export default MarginCalculator;
