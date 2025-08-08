package com.binancetrader.controller;

import com.binancetrader.model.User;
import com.binancetrader.service.BinanceApiService;
import com.binancetrader.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserService userService;
    private final BinanceApiService binanceApiService;
    
    /**
     * 사용자 정보 조회
     * GET /api/user/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserInfo(@PathVariable Long userId) {
        log.info("사용자 정보 조회 요청: {}", userId);
        
        try {
            User user = userService.findById(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("isActive", user.getIsActive());
            response.put("hasApiCredentials", user.getBinanceApiKey() != null && user.getBinanceSecretKey() != null);
            response.put("createdAt", user.getCreatedAt());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("사용자 정보 조회 실패: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "사용자 정보 조회 실패");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 바이낸스 API 키 설정
     * POST /api/user/{userId}/binance-credentials
     */
    @PostMapping("/{userId}/binance-credentials")
    public Mono<ResponseEntity<Map<String, Object>>> setBinanceCredentials(
            @PathVariable Long userId,
            @RequestBody Map<String, String> credentials) {
        
        log.info("바이낸스 API 키 설정 요청: {}", userId);
        
        String apiKey = credentials.get("apiKey");
        String secretKey = credentials.get("secretKey");
        
        if (apiKey == null || secretKey == null || apiKey.trim().isEmpty() || secretKey.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "API 키와 시크릿 키가 모두 필요합니다");
            return Mono.just(ResponseEntity.badRequest().body(errorResponse));
        }
        
        // API 키 유효성 검증
        return binanceApiService.validateApiCredentials(apiKey, secretKey)
            .map(isValid -> {
                if (isValid) {
                    try {
                        userService.updateBinanceCredentials(userId, apiKey, secretKey);
                        
                        Map<String, Object> response = new HashMap<>();
                        response.put("message", "바이낸스 API 키가 성공적으로 설정되었습니다");
                        response.put("success", true);
                        
                        return ResponseEntity.ok(response);
                    } catch (Exception e) {
                        log.error("API 키 저장 실패: {}", e.getMessage());
                        Map<String, Object> errorResponse = new HashMap<>();
                        errorResponse.put("message", "API 키 저장 중 오류가 발생했습니다");
                        return ResponseEntity.status(500).body(errorResponse);
                    }
                } else {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("message", "유효하지 않은 API 키입니다. 키를 확인해 주세요");
                    return ResponseEntity.badRequest().body(errorResponse);
                }
            })
            .onErrorReturn(ResponseEntity.status(500).body(Map.of("message", "API 키 검증 중 오류가 발생했습니다")));
    }
    
    /**
     * 계정 정보 조회 (바이낸스)
     * GET /api/user/{userId}/account
     */
    @GetMapping("/{userId}/account")
    public Mono<ResponseEntity<Map<String, Object>>> getAccountInfo(@PathVariable Long userId) {
        log.info("계정 정보 조회 요청: {}", userId);
        
        try {
            User user = userService.findById(userId);
            
            if (user.getBinanceApiKey() == null || user.getBinanceSecretKey() == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "API credentials not configured");
                return Mono.just(ResponseEntity.badRequest().body(errorResponse));
            }
            
            return binanceApiService.getAccountInfo(user.getBinanceApiKey(), user.getBinanceSecretKey())
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.status(500).body(Map.of("message", "계정 정보 조회 실패")));
                
        } catch (Exception e) {
            log.error("계정 정보 조회 실패: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "사용자를 찾을 수 없습니다");
            return Mono.just(ResponseEntity.status(404).body(errorResponse));
        }
    }
}