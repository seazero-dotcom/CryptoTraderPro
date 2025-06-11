import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceCard } from "@/components/price-card";
import { useWebSocket } from "@/hooks/use-websocket";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const allCoins = [
  { symbol: "BTCUSDT", name: "Bitcoin", icon: "₿", iconColor: "bg-orange-500" },
  { symbol: "ETHUSDT", name: "Ethereum", icon: "Ξ", iconColor: "bg-blue-500" },
  { symbol: "BNBUSDT", name: "Binance Coin", icon: "B", iconColor: "bg-yellow-500" },
  { symbol: "ADAUSDT", name: "Cardano", icon: "A", iconColor: "bg-blue-600" },
  { symbol: "SOLUSDT", name: "Solana", icon: "S", iconColor: "bg-purple-500" },
  { symbol: "DOTUSDT", name: "Polkadot", icon: "D", iconColor: "bg-pink-500" },
  { symbol: "MATICUSDT", name: "Polygon", icon: "M", iconColor: "bg-indigo-500" },
  { symbol: "AVAXUSDT", name: "Avalanche", icon: "A", iconColor: "bg-red-500" },
];

export default function Markets() {
  const { prices } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allPrices } = useQuery({
    queryKey: ["/api/prices"],
  });

  const filteredCoins = allCoins.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-16 md:pb-0 md:ml-64">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Markets</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time cryptocurrency market data</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Market Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCoins.map((coin) => (
            <PriceCard
              key={coin.symbol}
              symbol={coin.symbol.replace("USDT", "/USDT")}
              name={coin.name}
              icon={coin.icon}
              iconColor={coin.iconColor}
              data={prices.get(coin.symbol)}
            />
          ))}
        </div>

        {filteredCoins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No cryptocurrencies found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
