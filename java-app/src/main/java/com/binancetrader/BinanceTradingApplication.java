package com.binancetrader;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BinanceTradingApplication {
    public static void main(String[] args) {
        SpringApplication.run(BinanceTradingApplication.class, args);
    }
}