import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceCard } from "@/components/price-card";
import { useWebSocket } from "@/hooks/use-websocket";
import { Plus, Wallet, TrendingUp, Bot, ArrowUpDown, ArrowUp, ArrowDown, Activity, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const coinData = [
  { symbol: "BTCUSDT", name: "Bitcoin", icon: "₿", iconColor: "bg-orange-500" },
  { symbol: "ETHUSDT", name: "Ethereum", icon: "Ξ", iconColor: "bg-blue-500" },
  { symbol: "BNBUSDT", name: "Binance Coin", icon: "B", iconColor: "bg-yellow-500" },
];

export default function Dashboard() {
  const { prices } = useWebSocket();

  const { data: portfolio, error: portfolioError } = useQuery({
    queryKey: ["/api/portfolio/1"],
  });

  const { data: strategies } = useQuery({
    queryKey: ["/api/strategies/1"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders/1"],
  });

  const isApiKeyMissing = portfolioError && portfolioError.message?.includes("API credentials not configured");

  const totalBalance = portfolio && Array.isArray(portfolio) ? portfolio.reduce((acc: number, item: any) => {
    return acc + (parseFloat(item.free) * (prices.get(item.symbol + "USDT")?.lastPrice ? parseFloat(prices.get(item.symbol + "USDT")!.lastPrice) : 0));
  }, 0) : 12486.23;

  const activeStrategies = strategies && Array.isArray(strategies) ? strategies.filter((s: any) => s.isActive).length : 0;
  const todayOrders = orders && Array.isArray(orders) ? orders.filter((o: any) => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return today.toDateString() === orderDate.toDateString();
  }).length : 0;

  return (
    <div className="pb-16 md:pb-0 md:ml-64">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">트레이딩 대시보드</h1>
            <p className="text-sm text-muted-foreground mt-1">실시간 시장 현황</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              새 전략
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* API Key Warning */}
        {isApiKeyMissing && (
          <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              <span className="font-medium">API 키 설정이 필요합니다.</span> 설정에서 바이낸스 API 키를 추가하여 실제 포트폴리오 데이터를 확인하세요.{" "}
              <a href="/settings" className="underline hover:no-underline">
                설정으로 이동
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">총 잔고</p>
                  <p className="text-xl font-bold mt-1">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Wallet className="text-primary text-xl" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-green-500 text-xs">+2.45%</span>
                <span className="text-muted-foreground text-xs ml-1">24h</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">오늘 손익</p>
                  <p className="text-xl font-bold mt-1 text-green-500">+$284.12</p>
                </div>
                <TrendingUp className="text-green-500 text-xl" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-green-500 text-xs">+1.87%</span>
                <span className="text-muted-foreground text-xs ml-1">오늘</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">활성 전략</p>
                  <p className="text-xl font-bold mt-1">{activeStrategies}</p>
                </div>
                <Bot className="text-yellow-500 text-xl" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-muted-foreground text-xs">실행 중</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">오늘 주문</p>
                  <p className="text-xl font-bold mt-1">{todayOrders}</p>
                </div>
                <ArrowUpDown className="text-primary text-xl" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-green-500 text-xs">{Math.floor(todayOrders * 0.78)} 체결</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Overview */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader>
            <CardTitle>시장 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coinData.map((coin) => (
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
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {orders && Array.isArray(orders) ? orders.slice(0, 3).map((order: any, index: number) => (
                <div key={order.id || index} className="p-4 md:p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        order.side === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {order.side === 'BUY' ? (
                          <ArrowUp className="text-white text-sm" />
                        ) : (
                          <ArrowDown className="text-white text-sm" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {order.symbol} {order.side === 'BUY' ? 'Buy' : 'Sell'} Order {order.status}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {order.strategyId ? `Strategy ID: ${order.strategyId}` : 'Manual Order'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.quantity} {order.symbol.replace('USDT', '')}</p>
                      <p className="text-muted-foreground text-sm">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'Now'}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                // Empty state when no orders
                <div className="p-6 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground">Your trading activity will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
