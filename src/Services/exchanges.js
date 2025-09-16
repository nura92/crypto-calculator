// src/services/exchanges.js
import axios from "axios";

/**
 * Helper: try GET then return number or null
 */
async function tryGet(url, transform = (d) => d) {
  try {
    const res = await axios.get(url, { timeout: 8000 });
    return transform(res.data);
  } catch (e) {
    // console.warn("tryGet failed", url, e.message);
    return null;
  }
}

/**
 * Binance public price endpoint (spot)
 * Example: https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT
 */
export async function getBinancePrice(symbol = "BTC") {
  const pair = symbol.toUpperCase() + "USDT";
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`;
  return tryGet(url, (d) => d && parseFloat(d.price));
}

/**
 * Coinbase public spot price
 * Example: https://api.coinbase.com/v2/prices/BTC-USD/spot
 */
export async function getCoinbasePrice(symbol = "BTC") {
  const pair = `${symbol.toUpperCase()}-USD`;
  const url = `https://api.coinbase.com/v2/prices/${pair}/spot`;
  return tryGet(url, (d) => d && d.data && parseFloat(d.data.amount));
}

/**
 * Kraken public ticker
 * Kraken uses XBT as BTC symbol in many endpoints.
 * Example: https://api.kraken.com/0/public/Ticker?pair=XBTUSD
 */
export async function getKrakenPrice(symbol = "BTC") {
  // try XBT, then BTC
  const candidates = [`X${symbol.toUpperCase()}`.replace("XBTC", "XXBT"), `${symbol.toUpperCase()}USD`, `X${symbol.toUpperCase()}USD`];
  // simpler: use XBTUSD for BTC, otherwise SYMBOLUSD
  const pair = (symbol.toUpperCase() === "BTC") ? "XBTUSD" : `${symbol.toUpperCase()}USD`;
  const url = `https://api.kraken.com/0/public/Ticker?pair=${pair}`;
  return tryGet(url, (d) => {
    if (!d || !d.result) return null;
    const keys = Object.keys(d.result);
    if (keys.length === 0) return null;
    const first = d.result[keys[0]];
    // 'c' is last trade closed array: [price, lot volume]
    const price = first?.c?.[0];
    return price ? parseFloat(price) : null;
  });
}

/**
 * Bitstamp public ticker
 * Example: https://www.bitstamp.net/api/v2/ticker/btcusd/
 */
export async function getBitstampPrice(symbol = "BTC") {
  const pair = `${symbol.toLowerCase()}usd`;
  const url = `https://www.bitstamp.net/api/v2/ticker/${pair}/`;
  return tryGet(url, (d) => d && d.last ? parseFloat(d.last) : null);
}

/**
 * KuCoin Level 1 ticker
 * Example (public domain): https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT
 */
export async function getKucoinPrice(symbol = "BTC") {
  const pair = `${symbol.toUpperCase()}-USDT`;
  const url = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${pair}`;
  return tryGet(url, (d) => d && d.data && d.data.price ? parseFloat(d.data.price) : null);
}

/**
 * Fetch all exchanges at once; returns object like { binance: number|null, coinbase: number|null, ... }
 */
export async function fetchAllPrices(symbol = "BTC") {
  const [binance, coinbase, kraken, bitstamp, kucoin] = await Promise.allSettled([
    getBinancePrice(symbol),
    getCoinbasePrice(symbol),
    getKrakenPrice(symbol),
    getBitstampPrice(symbol),
    getKucoinPrice(symbol),
  ]);

  const pick = (p) => (p.status === "fulfilled" ? p.value : null);

  return {
    symbol: symbol.toUpperCase(),
    binance: pick(binance),
    coinbase: pick(coinbase),
    kraken: pick(kraken),
    bitstamp: pick(bitstamp),
    kucoin: pick(kucoin),
    timestamp: Date.now(),
  };
}
