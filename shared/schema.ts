import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const apiCredentials = pgTable("api_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret").notNull(),
  isTestnet: boolean("is_testnet").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(), // e.g., BTCUSDT
  buyPrice: decimal("buy_price", { precision: 18, scale: 8 }),
  buyAmount: decimal("buy_amount", { precision: 18, scale: 8 }),
  sellPrice: decimal("sell_price", { precision: 18, scale: 8 }),
  sellAmount: decimal("sell_amount", { precision: 18, scale: 8 }),
  isActive: boolean("is_active").default(false),
  pnl: decimal("pnl", { precision: 18, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  strategyId: integer("strategy_id"),
  binanceOrderId: text("binance_order_id"),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // BUY or SELL
  type: text("type").notNull(), // MARKET, LIMIT, etc.
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  price: decimal("price", { precision: 18, scale: 8 }),
  status: text("status").notNull(), // PENDING, FILLED, CANCELLED, etc.
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  free: decimal("free", { precision: 18, scale: 8 }).default("0"),
  locked: decimal("locked", { precision: 18, scale: 8 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertApiCredentialsSchema = createInsertSchema(apiCredentials).omit({
  id: true,
  createdAt: true,
});

export const insertStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolio).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ApiCredentials = typeof apiCredentials.$inferSelect;
export type InsertApiCredentials = z.infer<typeof insertApiCredentialsSchema>;

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Portfolio = typeof portfolio.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
