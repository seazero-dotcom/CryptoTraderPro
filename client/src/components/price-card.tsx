import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TickerData } from "@/lib/websocket";

interface PriceCardProps {
  symbol: string;
  name: string;
  icon: string;
  iconColor: string;
  data?: TickerData;
  onClick?: () => void;
}

export function PriceCard({ symbol, name, icon, iconColor, data, onClick }: PriceCardProps) {
  const price = data?.lastPrice ? parseFloat(data.lastPrice) : 0;
  const change = data?.priceChangePercent ? parseFloat(data.priceChangePercent) : 0;
  const isPositive = change >= 0;

  return (
    <Card 
      className="bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3",
                iconColor
              )}
            >
              {icon}
            </div>
            <div>
              <p className="font-medium">{symbol}</p>
              <p className="text-muted-foreground text-xs">{name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">
              ${price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
            <p className={cn(
              "text-sm",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? "+" : ""}{change.toFixed(2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
