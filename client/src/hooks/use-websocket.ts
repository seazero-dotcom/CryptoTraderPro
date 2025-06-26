import { useEffect, useState } from "react";
import { websocketManager, type WebSocketMessage, type TickerData } from "@/lib/websocket";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState<Map<string, TickerData>>(new Map());

  useEffect(() => {
    websocketManager.connect();

    websocketManager.onMessage("ticker", (message: WebSocketMessage) => {
      console.log("useWebSocket: Processing ticker message for", message.symbol, "with price", message.data.lastPrice);
      setPrices(prev => {
        const newPrices = new Map(prev);
        newPrices.set(message.symbol, message.data);
        console.log("useWebSocket: Updated prices map, now has", newPrices.size, "entries");
        console.log("useWebSocket: Price for", message.symbol, ":", newPrices.get(message.symbol)?.lastPrice);
        return newPrices;
      });
    });

    const checkConnection = () => {
      setIsConnected(websocketManager.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
      websocketManager.disconnect();
    };
  }, []);

  return {
    isConnected,
    prices,
    getPrice: (symbol: string) => prices.get(symbol),
  };
}
