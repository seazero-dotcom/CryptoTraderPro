import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertStrategySchema, insertApiCredentialsSchema, insertOrderSchema } from "@shared/schema";
import Binance from "binance-api-node";

export async function registerRoutes(app: Express): Promise<Server> {
  let binanceClient: any = null;
  
  // Initialize Binance client if API keys are available
  const initBinanceClient = async (userId: number) => {
    const credentials = await storage.getApiCredentials(userId);
    if (credentials) {
      binanceClient = Binance({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        useServerTime: true,
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
        useServerTime: true,
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
        useServerTime: true,
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
      // Use a default client for public market data
      const publicClient = Binance();
      const prices = await publicClient.prices();
      res.json(prices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/ticker/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const publicClient = Binance();
      const ticker = await publicClient.dailyStats({ symbol });
      res.json(ticker);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time data
  const wss = new WebSocketServer({ server: httpServer });
  
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    // Subscribe to price streams
    const publicClient = Binance();
    const streams = ["btcusdt@ticker", "ethusdt@ticker", "bnbusdt@ticker"];
    
    const cleanups: (() => void)[] = [];
    
    streams.forEach(stream => {
      const cleanup = publicClient.ws.ticker(stream.split('@')[0].toUpperCase(), (ticker) => {
        ws.send(JSON.stringify({
          type: "ticker",
          symbol: ticker.symbol,
          data: ticker
        }));
      });
      cleanups.push(cleanup);
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      cleanups.forEach(cleanup => cleanup());
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return httpServer;
}
