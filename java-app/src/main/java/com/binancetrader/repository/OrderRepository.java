package com.binancetrader.repository;

import com.binancetrader.model.Order;
import com.binancetrader.model.TradingStrategy;
import com.binancetrader.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUser(User user);
    
    List<Order> findByUserId(Long userId);
    
    List<Order> findByStrategy(TradingStrategy strategy);
    
    Optional<Order> findByBinanceOrderId(String binanceOrderId);
    
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.createdAt >= :startDate")
    List<Order> findRecentOrdersByUser(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.symbol = :symbol ORDER BY o.createdAt DESC")
    List<Order> findByUserIdAndSymbolOrderByCreatedAtDesc(@Param("userId") Long userId, @Param("symbol") String symbol);
    
    @Query("SELECT o FROM Order o WHERE o.status = :status")
    List<Order> findByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.createdAt >= :startDate")
    long countTodaysOrdersByUser(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
}