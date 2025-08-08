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
@Table(name = "trading_strategies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TradingStrategy {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String symbol; // BTC/USDT
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StrategyType type;
    
    @Column(name = "buy_condition", columnDefinition = "TEXT")
    private String buyCondition;
    
    @Column(name = "sell_condition", columnDefinition = "TEXT")
    private String sellCondition;
    
    @Column(name = "investment_amount", precision = 19, scale = 8)
    private BigDecimal investmentAmount;
    
    @Column(name = "stop_loss_percentage", precision = 5, scale = 2)
    private BigDecimal stopLossPercentage;
    
    @Column(name = "take_profit_percentage", precision = 5, scale = 2)
    private BigDecimal takeProfitPercentage;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum StrategyType {
        SCALPING, // 스캘핑
        DAY_TRADING, // 데이 트레이딩
        SWING_TRADING, // 스윙 트레이딩
        GRID_TRADING, // 그리드 트레이딩
        DCA, // 분할 평균 매수
        CUSTOM // 사용자 정의
    }
}