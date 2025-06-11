import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/use-websocket";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function Portfolio() {
  const { prices } = useWebSocket();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["/api/portfolio/1"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders/1"],
  });

  const calculatePortfolioValue = () => {
    if (!portfolio) return 0;
    return portfolio.reduce((total: number, holding: any) => {
      const price = prices.get(holding.symbol + "USDT");
      const currentPrice = price ? parseFloat(price.lastPrice) : 0;
      const totalAmount = parseFloat(holding.free) + parseFloat(holding.locked);
      return total + (totalAmount * currentPrice);
    }, 0);
  };

  const totalValue = calculatePortfolioValue();

  return (
    <div className="pb-16 md:pb-0 md:ml-64">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Portfolio</h1>
            <p className="text-sm text-muted-foreground mt-1">Your cryptocurrency holdings and trading history</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* Portfolio Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Portfolio Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center md:text-left">
                <p className="text-muted-foreground text-sm">Total Portfolio Value</p>
                <p className="text-2xl font-bold">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-muted-foreground text-sm">24h Change</p>
                <p className="text-2xl font-bold text-green-500">+$423.12</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-muted-foreground text-sm">Total P&L</p>
                <p className="text-2xl font-bold text-green-500">+$1,234.56</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holdings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-muted-foreground rounded-full mr-4"></div>
                      <div>
                        <div className="h-4 bg-muted-foreground rounded w-20 mb-2"></div>
                        <div className="h-3 bg-muted-foreground rounded w-16"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-muted-foreground rounded w-24 mb-2"></div>
                      <div className="h-3 bg-muted-foreground rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : portfolio && portfolio.length > 0 ? (
              <div className="space-y-4">
                {portfolio.map((holding: any, index: number) => {
                  const price = prices.get(holding.symbol + "USDT");
                  const currentPrice = price ? parseFloat(price.lastPrice) : 0;
                  const totalAmount = parseFloat(holding.free) + parseFloat(holding.locked);
                  const totalValue = totalAmount * currentPrice;
                  const change = price ? parseFloat(price.priceChangePercent) : 0;

                  return (
                    <div key={holding.symbol || index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-sm">
                            {holding.symbol ? holding.symbol.charAt(0) : 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{holding.symbol || 'Unknown'}</p>
                          <p className="text-muted-foreground text-sm">
                            {totalAmount.toFixed(6)} {holding.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center justify-end">
                          {change >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                          )}
                          <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No holdings found</p>
                <p className="text-sm text-muted-foreground">Start trading to see your portfolio here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 10).map((order: any, index: number) => (
                  <div key={order.id || index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center">
                      <Badge variant={order.side === 'BUY' ? 'default' : 'secondary'}>
                        {order.side}
                      </Badge>
                      <div className="ml-4">
                        <p className="font-medium">{order.symbol}</p>
                        <p className="text-muted-foreground text-sm">
                          {order.quantity} @ ${order.price}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          order.status === 'FILLED' ? 'default' : 
                          order.status === 'CANCELLED' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {order.status}
                      </Badge>
                      <p className="text-muted-foreground text-sm mt-1">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground">Your trading history will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
