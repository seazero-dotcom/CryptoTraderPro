#!/bin/bash

# Java Spring Boot 애플리케이션 실행 스크립트
echo "바이낸스 트레이딩 앱 Java 서버 시작 중..."

# 환경 변수 설정
export SPRING_PROFILES_ACTIVE=development
export SERVER_PORT=8080

# Maven을 사용하여 Spring Boot 애플리케이션 실행
cd java-app
mvn spring-boot:run -Dspring-boot.run.profiles=development