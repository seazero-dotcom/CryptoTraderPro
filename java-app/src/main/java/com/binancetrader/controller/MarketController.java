package com.binancetrader.controller;

import com.binancetrader.service.BinanceApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MarketController {
    
    private final BinanceApiService binanceApiService;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * 24시간 가격 변동 통계 조회
     * GET /api/market/24hr-ticker
     */
    @GetMapping("/24hr-ticker")
    public Mono<ResponseEntity<List<Map<String, Object>>>> get24hrTicker() {
        log.info("24시간 티커 정보 요청");
        
        return binanceApiService.get24hrTicker()
            .map(ResponseEntity::ok)
            .onErrorReturn(ResponseEntity.status(500).build());
    }
    
    /**
     * 특정 심볼의 현재 가격 조회
     * GET /api/market/price/{symbol}
     */
    @GetMapping("/price/{symbol}")
    public Mono<ResponseEntity<Map<String, Object>>> getSymbolPrice(@PathVariable String symbol) {
        log.info("심볼 {} 가격 정보 요청", symbol);
        
        return binanceApiService.getSymbolPrice(symbol.toUpperCase())
            .map(ResponseEntity::ok)
            .onErrorReturn(ResponseEntity.status(500).build());
    }
    
    /**
     * 주요 암호화폐 목록의 가격 정보
     * GET /api/market/major-symbols
     */
    @GetMapping("/major-symbols")
    public Mono<ResponseEntity<Map<String, Object>>> getMajorSymbolsPrices() {
        log.info("주요 암호화폐 가격 정보 요청");
        
        String[] majorSymbols = {
            "BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", 
            "SOLUSDT", "DOTUSDT", "MATICUSDT", "AVAXUSDT", "LINKUSDT"
        };
        
        return binanceApiService.get24hrTicker()
            .map(allTickers -> {
                Map<String, Object> result = new java.util.HashMap<>();
                
                for (Map<String, Object> ticker : allTickers) {
                    String symbol = (String) ticker.get("symbol");
                    if (java.util.Arrays.asList(majorSymbols).contains(symbol)) {
                        result.put(symbol, ticker);
                    }
                }
                
                return ResponseEntity.ok(result);
            })
            .onErrorReturn(ResponseEntity.status(500).build());
    }
    
    /**
     * WebSocket을 통한 실시간 가격 데이터 전송
     * 5초마다 실행
     */
    @Scheduled(fixedRate = 5000)
    public void sendRealTimeMarketData() {
        String[] majorSymbols = {
            "BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", 
            "SOLUSDT", "DOTUSDT", "MATICUSDT", "AVAXUSDT", "LINKUSDT"
        };
        
        for (String symbol : majorSymbols) {
            binanceApiService.getSymbolPrice(symbol)
                .subscribe(
                    priceData -> {
                        try {
                            // 가격 데이터에 타임스탬프 추가
                            Map<String, Object> marketData = new HashMap<>(priceData);
                            marketData.put("timestamp", System.currentTimeMillis());
                            
                            // WebSocket을 통해 클라이언트에 전송
                            messagingTemplate.convertAndSend("/topic/market/" + symbol, marketData);
                            
                            log.debug("실시간 가격 데이터 전송: {} = ${}", symbol, priceData.get("price"));
                        } catch (Exception e) {
                            log.error("실시간 데이터 전송 실패 {}: {}", symbol, e.getMessage());
                        }
                    },
                    error -> log.error("심볼 {} 가격 조회 실패: {}", symbol, error.getMessage())
                );
        }
    }
    
    /**
     * WebSocket 메시지 처리
     */
    @MessageMapping("/market/subscribe")
    public void subscribeToMarket(String symbol) {
        log.info("시장 데이터 구독 요청: {}", symbol);
        
        // 즉시 현재 가격 전송
        binanceApiService.getSymbolPrice(symbol)
            .subscribe(
                priceData -> {
                    Map<String, Object> marketData = new HashMap<>(priceData);
                    marketData.put("timestamp", System.currentTimeMillis());
                    messagingTemplate.convertAndSend("/topic/market/" + symbol, marketData);
                },
                error -> log.error("즉시 가격 조회 실패 {}: {}", symbol, error.getMessage())
            );
    }
}