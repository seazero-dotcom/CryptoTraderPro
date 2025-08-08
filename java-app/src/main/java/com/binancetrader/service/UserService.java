package com.binancetrader.service;

import com.binancetrader.model.User;
import com.binancetrader.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    
    /**
     * 사용자 ID로 조회
     */
    public User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + id));
    }
    
    /**
     * 사용자명으로 조회
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * 새 사용자 생성
     */
    public User createUser(String username, String email, String password) {
        // 중복 확인
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("이미 존재하는 사용자명입니다: " + username);
        }
        
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 존재하는 이메일입니다: " + email);
        }
        
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password); // 실제 구현시 암호화 필요
        user.setIsActive(true);
        
        User savedUser = userRepository.save(user);
        log.info("새 사용자 생성: {}", savedUser.getUsername());
        
        return savedUser;
    }
    
    /**
     * 바이낸스 API 자격 증명 업데이트
     */
    public void updateBinanceCredentials(Long userId, String apiKey, String secretKey) {
        User user = findById(userId);
        user.setBinanceApiKey(apiKey);
        user.setBinanceSecretKey(secretKey);
        userRepository.save(user);
        
        log.info("사용자 {} 바이낸스 API 키 업데이트 완료", user.getUsername());
    }
    
    /**
     * 바이낸스 자격 증명이 있는 활성 사용자 조회
     */
    public Optional<User> findActiveUserWithBinanceCredentials() {
        return userRepository.findActiveUserWithBinanceCredentials();
    }
    
    /**
     * 사용자 활성화 상태 변경
     */
    public void updateActiveStatus(Long userId, Boolean isActive) {
        User user = findById(userId);
        user.setIsActive(isActive);
        userRepository.save(user);
        
        log.info("사용자 {} 활성화 상태 변경: {}", user.getUsername(), isActive);
    }
    
    /**
     * 기본 사용자 생성 (없을 경우)
     */
    @Transactional
    public User createDefaultUserIfNotExists() {
        Optional<User> existingUser = userRepository.findById(1L);
        
        if (existingUser.isEmpty()) {
            log.info("기본 사용자 생성 중...");
            return createUser("admin", "admin@example.com", "admin123");
        }
        
        return existingUser.get();
    }
}