import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Strategy } from "@shared/schema";

interface StrategyCardProps {
  strategy: Strategy;
  onEdit: (strategy: Strategy) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, isActive: boolean) => void;
}

export function StrategyCard({ strategy, onEdit, onDelete, onToggle }: StrategyCardProps) {
  const pnl = parseFloat(strategy.pnl || "0");
  const isPositivePnL = pnl >= 0;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div 
              className={cn(
                "w-3 h-3 rounded-full mr-3",
                strategy.isActive ? "bg-green-500" : "bg-yellow-500"
              )}
            />
            <h3 className="font-semibold">{strategy.name}</h3>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(strategy)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(strategy.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pair:</span>
            <span>{strategy.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Buy Condition:</span>
            <span className="text-sm">Price ≤ ${strategy.buyPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Buy Amount:</span>
            <span>${strategy.buyAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sell Condition:</span>
            <span className="text-sm">Price ≥ ${strategy.sellPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">P&L:</span>
            <span className={cn(
              isPositivePnL ? "text-green-500" : "text-red-500"
            )}>
              {isPositivePnL ? "+" : ""}${pnl.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button
            variant={strategy.isActive ? "destructive" : "default"}
            size="sm"
            onClick={() => onToggle(strategy.id, !strategy.isActive)}
          >
            {strategy.isActive ? (
              <>
                <Square className="h-4 w-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Start
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(strategy)}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
