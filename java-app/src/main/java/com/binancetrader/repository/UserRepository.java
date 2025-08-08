package com.binancetrader.repository;

import com.binancetrader.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.binanceApiKey IS NOT NULL AND u.binanceSecretKey IS NOT NULL AND u.isActive = true")
    Optional<User> findActiveUserWithBinanceCredentials();
    
    @Query("SELECT u FROM User u WHERE u.id = :userId AND u.binanceApiKey IS NOT NULL AND u.binanceSecretKey IS NOT NULL")
    Optional<User> findUserWithBinanceCredentials(@Param("userId") Long userId);
}