import { useEffect, useState } from "react";
import { websocketManager, type WebSocketMessage, type TickerData } from "@/lib/websocket";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState<Map<string, TickerData>>(new Map());

  useEffect(() => {
    websocketManager.connect();

    websocketManager.onMessage("ticker", (message: WebSocketMessage) => {
      setPrices(prev => {
        const newPrices = new Map(prev);
        newPrices.set(message.symbol, message.data);
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
