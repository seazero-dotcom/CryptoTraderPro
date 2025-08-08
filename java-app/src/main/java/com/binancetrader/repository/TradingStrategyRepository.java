package com.binancetrader.repository;

import com.binancetrader.model.TradingStrategy;
import com.binancetrader.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradingStrategyRepository extends JpaRepository<TradingStrategy, Long> {
    
    List<TradingStrategy> findByUser(User user);
    
    List<TradingStrategy> findByUserIdAndIsActive(Long userId, Boolean isActive);
    
    @Query("SELECT ts FROM TradingStrategy ts WHERE ts.user.id = :userId")
    List<TradingStrategy> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT ts FROM TradingStrategy ts WHERE ts.isActive = true")
    List<TradingStrategy> findAllActiveStrategies();
    
    @Query("SELECT ts FROM TradingStrategy ts WHERE ts.user.id = :userId AND ts.symbol = :symbol")
    List<TradingStrategy> findByUserIdAndSymbol(@Param("userId") Long userId, @Param("symbol") String symbol);
    
    long countByUserIdAndIsActive(Long userId, Boolean isActive);
}