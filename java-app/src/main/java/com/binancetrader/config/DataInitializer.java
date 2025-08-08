package com.binancetrader.config;

import com.binancetrader.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserService userService;
    
    @Override
    public void run(String... args) {
        log.info("데이터 초기화 시작");
        
        try {
            // 기본 사용자 생성
            userService.createDefaultUserIfNotExists();
            log.info("데이터 초기화 완료");
        } catch (Exception e) {
            log.error("데이터 초기화 실패: {}", e.getMessage());
        }
    }
}