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

  // Market data
  app.get("/api/prices", async (req, res) => {
    try {
      // Use authenticated client for market data
      const authenticatedClient = Binance({
        apiKey: process.env.BINANCE_API_KEY,
        apiSecret: process.env.BINANCE_API_SECRET,
      });
      const prices = await authenticatedClient.prices();
      res.json(prices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

  // WebSocket server for real-time data on a different port
  const wss = new WebSocketServer({ port: 8080 });
  
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    // Subscribe to real Binance price streams
    const authenticatedClient = Binance({
      apiKey: process.env.BINANCE_API_KEY,
      apiSecret: process.env.BINANCE_API_SECRET,
    });
    
    const streams = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];
    const cleanups: (() => void)[] = [];
    
    streams.forEach(symbol => {
      try {
        const cleanup = authenticatedClient.ws.ticker(symbol, (ticker: any) => {
          ws.send(JSON.stringify({
            type: "ticker",
            symbol: ticker.symbol,
            data: ticker
          }));
        });
        cleanups.push(cleanup);
      } catch (error) {
        console.error(`Failed to subscribe to ${symbol}:`, error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      cleanups.forEach(cleanup => cleanup());
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      cleanups.forEach(cleanup => cleanup());
    });
  });

  return httpServer;
}
