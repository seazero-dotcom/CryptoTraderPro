import { 
  users, 
  apiCredentials,
  strategies, 
  orders,
  portfolio,
  type User, 
  type InsertUser,
  type ApiCredentials,
  type InsertApiCredentials,
  type Strategy,
  type InsertStrategy,
  type Order,
  type InsertOrder,
  type Portfolio,
  type InsertPortfolio
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // API Credentials
  getApiCredentials(userId: number): Promise<ApiCredentials | undefined>;
  createApiCredentials(credentials: InsertApiCredentials): Promise<ApiCredentials>;
  updateApiCredentials(userId: number, credentials: Partial<InsertApiCredentials>): Promise<ApiCredentials | undefined>;

  // Strategies
  getStrategies(userId: number): Promise<Strategy[]>;
  getStrategy(id: number): Promise<Strategy | undefined>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  updateStrategy(id: number, strategy: Partial<InsertStrategy>): Promise<Strategy | undefined>;
  deleteStrategy(id: number): Promise<boolean>;

  // Orders
  getOrders(userId: number): Promise<Order[]>;
  getOrdersByStrategy(strategyId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;

  // Portfolio
  getPortfolio(userId: number): Promise<Portfolio[]>;
  getPortfolioBySymbol(userId: number, symbol: string): Promise<Portfolio | undefined>;
  upsertPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiCredentials: Map<number, ApiCredentials>;
  private strategies: Map<number, Strategy>;
  private orders: Map<number, Order>;
  private portfolios: Map<number, Portfolio>;
  private currentUserId: number;
  private currentCredentialsId: number;
  private currentStrategyId: number;
  private currentOrderId: number;
  private currentPortfolioId: number;

  constructor() {
    this.users = new Map();
    this.apiCredentials = new Map();
    this.strategies = new Map();
    this.orders = new Map();
    this.portfolios = new Map();
    this.currentUserId = 1;
    this.currentCredentialsId = 1;
    this.currentStrategyId = 1;
    this.currentOrderId = 1;
    this.currentPortfolioId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // API Credentials
  async getApiCredentials(userId: number): Promise<ApiCredentials | undefined> {
    return Array.from(this.apiCredentials.values()).find(
      (cred) => cred.userId === userId
    );
  }

  async createApiCredentials(credentials: InsertApiCredentials): Promise<ApiCredentials> {
    const id = this.currentCredentialsId++;
    const cred: ApiCredentials = { 
      ...credentials, 
      id, 
      createdAt: new Date() 
    };
    this.apiCredentials.set(id, cred);
    return cred;
  }

  async updateApiCredentials(userId: number, credentials: Partial<InsertApiCredentials>): Promise<ApiCredentials | undefined> {
    const existing = await this.getApiCredentials(userId);
    if (!existing) return undefined;
    
    const updated: ApiCredentials = { ...existing, ...credentials };
    this.apiCredentials.set(existing.id, updated);
    return updated;
  }

  // Strategies
  async getStrategies(userId: number): Promise<Strategy[]> {
    return Array.from(this.strategies.values()).filter(
      (strategy) => strategy.userId === userId
    );
  }

  async getStrategy(id: number): Promise<Strategy | undefined> {
    return this.strategies.get(id);
  }

  async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
    const id = this.currentStrategyId++;
    const newStrategy: Strategy = { 
      ...strategy, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.strategies.set(id, newStrategy);
    return newStrategy;
  }

  async updateStrategy(id: number, strategy: Partial<InsertStrategy>): Promise<Strategy | undefined> {
    const existing = this.strategies.get(id);
    if (!existing) return undefined;
    
    const updated: Strategy = { 
      ...existing, 
      ...strategy, 
      updatedAt: new Date() 
    };
    this.strategies.set(id, updated);
    return updated;
  }

  async deleteStrategy(id: number): Promise<boolean> {
    return this.strategies.delete(id);
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async getOrdersByStrategy(strategyId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.strategyId === strategyId
    );
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = { 
      ...order, 
      id,
      createdAt: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated: Order = { ...existing, ...order };
    this.orders.set(id, updated);
    return updated;
  }

  // Portfolio
  async getPortfolio(userId: number): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter(
      (portfolio) => portfolio.userId === userId
    );
  }

  async getPortfolioBySymbol(userId: number, symbol: string): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values()).find(
      (portfolio) => portfolio.userId === userId && portfolio.symbol === symbol
    );
  }

  async upsertPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const existing = await this.getPortfolioBySymbol(portfolio.userId, portfolio.symbol);
    
    if (existing) {
      const updated: Portfolio = { 
        ...existing, 
        ...portfolio, 
        updatedAt: new Date() 
      };
      this.portfolios.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentPortfolioId++;
      const newPortfolio: Portfolio = { 
        ...portfolio, 
        id,
        updatedAt: new Date()
      };
      this.portfolios.set(id, newPortfolio);
      return newPortfolio;
    }
  }
}

export const storage = new MemStorage();
