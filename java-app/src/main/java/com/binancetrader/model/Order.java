package com.binancetrader.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id")
    private TradingStrategy strategy;
    
    @Column(name = "binance_order_id")
    private String binanceOrderId;
    
    @Column(nullable = false)
    private String symbol; // BTCUSDT
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderSide side;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal quantity;
    
    @Column(precision = 19, scale = 8)
    private BigDecimal price;
    
    @Column(name = "executed_quantity", precision = 19, scale = 8)
    private BigDecimal executedQuantity;
    
    @Column(name = "executed_price", precision = 19, scale = 8)
    private BigDecimal executedPrice;
    
    @Column(name = "commission", precision = 19, scale = 8)
    private BigDecimal commission;
    
    @Column(name = "commission_asset")
    private String commissionAsset;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum OrderSide {
        BUY, SELL
    }
    
    public enum OrderType {
        MARKET, LIMIT, STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT
    }
    
    public enum OrderStatus {
        NEW, PARTIALLY_FILLED, FILLED, CANCELED, EXPIRED, REJECTED
    }
}