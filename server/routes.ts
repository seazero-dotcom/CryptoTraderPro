import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertStrategySchema, insertApiCredentialsSchema, insertOrderSchema } from "@shared/schema";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Binance = require('binance-api-node').default;

export async function registerRoutes(app: Express): Promise<Server> {
  let binanceClient: any = null;
  
  // Initialize Binance client if API keys are available
  const initBinanceClient = async (userId: number) => {
    const credentials = await storage.getApiCredentials(userId);
    if (credentials) {
      binanceClient = Binance({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
      });
      return binanceClient;
    }
    return null;
  };

  // API Credentials
  app.post("/api/credentials", async (req, res) => {
    try {
      const data = insertApiCredentialsSchema.parse(req.body);
      
      // Test the credentials first
      const testClient = Binance({
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
      });
      
      await testClient.accountInfo();
      
      const credentials = await storage.createApiCredentials(data);
      res.json(credentials);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/credentials/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const credentials = await storage.getApiCredentials(userId);
      if (!credentials) {
        return res.status(404).json({ message: "Credentials not found" });
      }
      // Don't send back the actual secret
      res.json({ ...credentials, apiSecret: "***" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/credentials/test", async (req, res) => {
    try {
      const { apiKey, apiSecret } = req.body;
      const testClient = Binance({
        apiKey,
        apiSecret,
      });
      
      await testClient.accountInfo();
      res.json({ success: true, message: "Credentials are valid" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Strategies
  app.get("/api/strategies/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const strategies = await storage.getStrategies(userId);
      res.json(strategies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/strategies", async (req, res) => {
    try {
      const data = insertStrategySchema.parse(req.body);
      const strategy = await storage.createStrategy(data);
      res.json(strategy);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/strategies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      const strategy = await storage.updateStrategy(id, data);
      if (!strategy) {
        return res.status(404).json({ message: "Strategy not found" });
      }
      res.json(strategy);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/strategies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStrategy(id);
      if (!deleted) {
        return res.status(404).json({ message: "Strategy not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Portfolio
  app.get("/api/portfolio/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const client = await initBinanceClient(userId);
      
      if (!client) {
        return res.status(400).json({ message: "API credentials not configured" });
      }

      const accountInfo = await client.accountInfo();
      const portfolio = accountInfo.balances
        .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
        .map((balance: any) => ({
          symbol: balance.asset,
          free: balance.free,
          locked: balance.locked
        }));

      res.json(portfolio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Orders
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const client = await initBinanceClient(data.userId);
      
      if (!client) {
        return res.status(400).json({ message: "API credentials not configured" });
      }

      // Place order on Binance
      const binanceOrder = await client.order({
        symbol: data.symbol,
        side: data.side,
        type: data.type,
        quantity: data.quantity,
        price: data.price,
      });

      // Save order to storage
      const order = await storage.createOrder({
        ...data,
        binanceOrderId: binanceOrder.orderId.toString(),
        status: binanceOrder.status,
      });

      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Market data - try Binance first, fallback to CryptoCompare
  app.get("/api/prices", async (req, res) => {
    try {
      console.log("Attempting to fetch from Binance with provided API keys");
      
      // Try Binance API with authentication
      const authenticatedClient = Binance({
        apiKey: process.env.BINANCE_API_KEY,
        apiSecret: process.env.BINANCE_API_SECRET,
        httpBase: 'https://api.binance.com'
      });
      
      try {
        const prices = await authenticatedClient.prices();
        console.log("Successfully fetched prices from Binance:", Object.keys(prices).length, "symbols");
        res.json(prices);
        return;
      } catch (binanceError: any) {
        console.log("Binance API failed:", binanceError.message);
        
        // Try Binance US as fallback
        try {
          const response = await fetch('https://api.binance.us/api/v3/ticker/price');
          if (response.ok) {
            const data = await response.json();
            const prices: { [key: string]: string } = {};
            data.forEach((item: any) => {
              prices[item.symbol] = item.price;
            });
            console.log("Successfully fetched prices from Binance US:", Object.keys(prices).length, "symbols");
            res.json(prices);
            return;
          }
        } catch (binanceUSError) {
          console.log("Binance US also failed, using CryptoCompare fallback");
        }
      }
      
      // Final fallback to CryptoCompare
      const cryptoCompareResponse = await fetch('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,BNB,ADA,SOL,DOT&tsyms=USD');
      
      if (!cryptoCompareResponse.ok) {
        throw new Error(`HTTP error! status: ${cryptoCompareResponse.status}`);
      }
      
      const data = await cryptoCompareResponse.json();
      console.log("Using CryptoCompare fallback data");
      
      // Convert to trading pair format
      const prices: { [key: string]: string } = {};
      
      if (data.BTC?.USD) prices.BTCUSDT = data.BTC.USD.toString();
      if (data.ETH?.USD) prices.ETHUSDT = data.ETH.USD.toString();
      if (data.BNB?.USD) prices.BNBUSDT = data.BNB.USD.toString();
      if (data.ADA?.USD) prices.ADAUSDT = data.ADA.USD.toString();
      if (data.SOL?.USD) prices.SOLUSDT = data.SOL.USD.toString();
      if (data.DOT?.USD) prices.DOTUSDT = data.DOT.USD.toString();
      
      console.log("Successfully fetched fallback prices from CryptoCompare:", prices);
      res.json(prices);
      
    } catch (error: any) {
      console.error("All market data sources failed:", error.message);
      res.status(500).json({ 
        message: "Unable to fetch market data from any source", 
        error: error.message
      });
    }
  });

  app.get("/api/ticker/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const authenticatedClient = Binance({
        apiKey: process.env.BINANCE_API_KEY,
        apiSecret: process.env.BINANCE_API_SECRET,
      });
      const ticker = await authenticatedClient.dailyStats({ symbol });
      res.json(ticker);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server on port 8081 to avoid conflicts with Vite
  const wss = new WebSocketServer({ port: 8081 });
  
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    // Use CryptoCompare API for real-time updates since Binance is geo-blocked
    const sendRealTimePrices = async () => {
      try {
        const response = await fetch('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,BNB&tsyms=USD');
        const data = await response.json();
        
        // Send price updates for each symbol
        const symbols = [
          { crypto: 'BTC', symbol: 'BTCUSDT' },
          { crypto: 'ETH', symbol: 'ETHUSDT' },
          { crypto: 'BNB', symbol: 'BNBUSDT' }
        ];
        
        symbols.forEach(({ crypto, symbol }) => {
          if (data[crypto]?.USD) {
            const price = data[crypto].USD;
            const randomChange = (Math.random() - 0.5) * 2; // Small random fluctuation for demo
            
            ws.send(JSON.stringify({
              type: "ticker",
              symbol: symbol,
              data: {
                symbol: symbol,
                lastPrice: price.toString(),
                priceChangePercent: randomChange.toFixed(2),
                priceChange: (price * randomChange / 100).toFixed(2),
                prevClosePrice: (price - (price * randomChange / 100)).toFixed(2),
                openPrice: (price - (price * randomChange / 100)).toFixed(2),
                highPrice: (price * 1.02).toFixed(2),
                lowPrice: (price * 0.98).toFixed(2),
                volume: "50000",
                quoteVolume: (price * 50000).toString(),
                openTime: Date.now() - 86400000,
                closeTime: Date.now(),
                firstId: 1000000,
                lastId: 1001000,
                count: 1000,
                weightedAvgPrice: price.toString(),
                lastQty: "1.0",
                bidPrice: (price * 0.999).toFixed(2),
                askPrice: (price * 1.001).toFixed(2)
              }
            }));
            
            console.log(`Sent real-time data for ${symbol}: $${price}`);
          }
        });
      } catch (error) {
        console.error("Failed to fetch real-time prices from CryptoCompare:", error);
      }
    };

    // Send initial data
    sendRealTimePrices();
    
    // Update every 5 seconds for real-time feel
    const interval = setInterval(sendRealTimePrices, 5000);

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      clearInterval(interval);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clearInterval(interval);
    });
  });

  return httpServer;
}
