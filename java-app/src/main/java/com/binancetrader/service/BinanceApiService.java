package com.binancetrader.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;

@Service
@Slf4j
public class BinanceApiService {
    
    @Value("${binance.api.base-url}")
    private String baseUrl;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public BinanceApiService() {
        this.webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * 24시간 가격 변동 통계 조회
     */
    public Mono<List<Map<String, Object>>> get24hrTicker() {
        return webClient.get()
            .uri(baseUrl + "/api/v3/ticker/24hr")
            .retrieve()
            .bodyToMono(String.class)
            .map(this::parseJsonToList)
            .doOnError(error -> log.error("24시간 티커 조회 실패: {}", error.getMessage()));
    }
    
    /**
     * 특정 심볼의 현재 가격 조회
     */
    public Mono<Map<String, Object>> getSymbolPrice(String symbol) {
        return webClient.get()
            .uri(baseUrl + "/api/v3/ticker/price?symbol=" + symbol)
            .retrieve()
            .bodyToMono(String.class)
            .map(this::parseJsonToMap)
            .doOnError(error -> log.error("심볼 {} 가격 조회 실패: {}", symbol, error.getMessage()));
    }
    
    /**
     * 계정 정보 조회 (API 키 필요)
     */
    public Mono<Map<String, Object>> getAccountInfo(String apiKey, String secretKey) {
        try {
            String timestamp = String.valueOf(Instant.now().toEpochMilli());
            String queryString = "timestamp=" + timestamp;
            String signature = generateSignature(queryString, secretKey);
            
            return webClient.get()
                .uri(baseUrl + "/api/v3/account?" + queryString + "&signature=" + signature)
                .header("X-MBX-APIKEY", apiKey)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseJsonToMap)
                .doOnError(error -> log.error("계정 정보 조회 실패: {}", error.getMessage()));
        } catch (Exception e) {
            log.error("계정 정보 조회 중 오류 발생: {}", e.getMessage());
            return Mono.error(e);
        }
    }
    
    /**
     * API 키 유효성 검증
     */
    public Mono<Boolean> validateApiCredentials(String apiKey, String secretKey) {
        return getAccountInfo(apiKey, secretKey)
            .map(accountInfo -> true)
            .onErrorReturn(false);
    }
    
    /**
     * 주문 생성 (테스트용)
     */
    public Mono<Map<String, Object>> createTestOrder(String apiKey, String secretKey, 
                                                   String symbol, String side, String type, 
                                                   String quantity, String price) {
        try {
            String timestamp = String.valueOf(Instant.now().toEpochMilli());
            
            Map<String, String> params = new HashMap<>();
            params.put("symbol", symbol);
            params.put("side", side);
            params.put("type", type);
            params.put("quantity", quantity);
            if (price != null && !"MARKET".equals(type)) {
                params.put("price", price);
            }
            params.put("timestamp", timestamp);
            
            String queryString = buildQueryString(params);
            String signature = generateSignature(queryString, secretKey);
            
            return webClient.post()
                .uri(baseUrl + "/api/v3/order/test?" + queryString + "&signature=" + signature)
                .header("X-MBX-APIKEY", apiKey)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseJsonToMap)
                .doOnError(error -> log.error("테스트 주문 생성 실패: {}", error.getMessage()));
        } catch (Exception e) {
            log.error("테스트 주문 생성 중 오류 발생: {}", e.getMessage());
            return Mono.error(e);
        }
    }
    
    /**
     * 서명 생성 (HMAC SHA256)
     */
    private String generateSignature(String data, String secretKey) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
        mac.init(secretKeySpec);
        
        byte[] hash = mac.doFinal(data.getBytes());
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    /**
     * 쿼리 스트링 생성
     */
    private String buildQueryString(Map<String, String> params) {
        return params.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
            .reduce((p1, p2) -> p1 + "&" + p2)
            .orElse("");
    }
    
    /**
     * JSON 문자열을 Map으로 파싱
     */
    private Map<String, Object> parseJsonToMap(String json) {
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.error("JSON 파싱 실패: {}", e.getMessage());
            return new HashMap<>();
        }
    }
    
    /**
     * JSON 문자열을 List로 파싱
     */
    private List<Map<String, Object>> parseJsonToList(String json) {
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception e) {
            log.error("JSON 리스트 파싱 실패: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
}