import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWebSocket } from "@/hooks/use-websocket";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export default function Portfolio() {
  const { prices } = useWebSocket();

  const { data: portfolio, isLoading, error: portfolioError } = useQuery({
    queryKey: ["/api/portfolio/1"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders/1"],
  });

  const calculatePortfolioValue = () => {
    if (!portfolio || !Array.isArray(portfolio)) return 0;
    return portfolio.reduce((total: number, holding: any) => {
      const price = prices.get(holding.symbol + "USDT");
      const currentPrice = price ? parseFloat(price.lastPrice) : 0;
      const totalAmount = parseFloat(holding.free) + parseFloat(holding.locked);
      return total + (totalAmount * currentPrice);
    }, 0);
  };

  const totalValue = calculatePortfolioValue();
  const isApiKeyMissing = portfolioError && portfolioError.message?.includes("API credentials not configured");

  return (
    <div className="pb-16 md:pb-0 md:ml-64">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">포트폴리오</h1>
            <p className="text-sm text-muted-foreground mt-1">보유 암호화폐 및 거래 내역</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* API Key Warning */}
        {isApiKeyMissing && (
          <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              <span className="font-medium">API 키 설정이 필요합니다.</span> 설정에서 바이낸스 API 키를 추가하여 포트폴리오 데이터를 확인하세요.{" "}
              <a href="/settings" className="underline hover:no-underline">
                설정으로 이동
              </a>
            </AlertDescription>
          </Alert>
        )}
        {/* Portfolio Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              포트폴리오 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center md:text-left">
                <p className="text-muted-foreground text-sm">총 포트폴리오 가치</p>
                <p className="text-2xl font-bold">
                  {isApiKeyMissing ? (
                    <span className="text-muted-foreground">API 키 필요</span>
                  ) : (
                    `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-muted-foreground text-sm">24시간 변화</p>
                <p className="text-2xl font-bold">
                  {isApiKeyMissing ? (
                    <span className="text-muted-foreground">API 키 필요</span>
                  ) : (
                    <span className="text-green-500">+$0.00</span>
                  )}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-muted-foreground text-sm">총 손익</p>
                <p className="text-2xl font-bold">
                  {isApiKeyMissing ? (
                    <span className="text-muted-foreground">API 키 필요</span>
                  ) : (
                    <span className="text-green-500">+$0.00</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holdings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>보유 자산</CardTitle>
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
            ) : portfolio && Array.isArray(portfolio) && portfolio.length > 0 ? (
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
                <p className="text-muted-foreground mb-2">API 키 설정이 필요합니다</p>
                <p className="text-sm text-muted-foreground mb-4">포트폴리오 데이터를 확인하려면 설정에서 바이낸스 API 키를 추가해주세요</p>
                <a 
                  href="/settings" 
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  설정으로 이동
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && Array.isArray(orders) && orders.length > 0 ? (
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
