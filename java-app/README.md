# 바이낸스 트레이딩 앱 - Java Spring Boot 버전

이 디렉토리에는 Java Spring Boot로 구현된 바이낸스 트레이딩 애플리케이션이 포함되어 있습니다.

## 프로젝트 구조

```
java-app/
├── src/main/java/com/binancetrader/
│   ├── BinanceTradingApplication.java          # 메인 애플리케이션 클래스
│   ├── model/                                  # JPA 엔티티
│   │   ├── User.java                          # 사용자 엔티티
│   │   ├── TradingStrategy.java               # 트레이딩 전략 엔티티
│   │   └── Order.java                         # 주문 엔티티
│   ├── repository/                            # 데이터 저장소 인터페이스
│   │   ├── UserRepository.java
│   │   ├── TradingStrategyRepository.java
│   │   └── OrderRepository.java
│   ├── service/                               # 비즈니스 로직
│   │   ├── BinanceApiService.java             # 바이낸스 API 서비스
│   │   └── UserService.java                  # 사용자 관리 서비스
│   ├── controller/                            # REST API 컨트롤러
│   │   ├── MarketController.java              # 시장 데이터 API
│   │   └── UserController.java               # 사용자 관리 API
│   └── config/                                # 설정 클래스
│       ├── WebSocketConfig.java               # WebSocket 설정
│       └── DataInitializer.java               # 초기 데이터 설정
├── src/main/resources/
│   └── application.yml                        # 애플리케이션 설정
├── pom.xml                                    # Maven 의존성 설정
└── run-java.sh                                # 실행 스크립트
```

## 주요 기능

### 1. 사용자 관리
- 사용자 생성 및 인증
- 바이낸스 API 키 설정 및 검증
- 계정 정보 조회

### 2. 시장 데이터
- 실시간 암호화폐 가격 조회
- 24시간 가격 변동 통계
- WebSocket을 통한 실시간 데이터 스트리밍

### 3. 트레이딩 전략
- 자동 트레이딩 전략 설정
- 주문 실행 및 추적
- 포트폴리오 관리

### 4. 실시간 기능
- WebSocket 기반 실시간 가격 업데이트
- 스케줄러를 통한 주기적 데이터 갱신

## API 엔드포인트

### 시장 데이터
- `GET /api/market/24hr-ticker` - 24시간 가격 변동 통계
- `GET /api/market/price/{symbol}` - 특정 심볼 가격 조회
- `GET /api/market/major-symbols` - 주요 암호화폐 가격 정보

### 사용자 관리
- `GET /api/user/{userId}` - 사용자 정보 조회
- `POST /api/user/{userId}/binance-credentials` - 바이낸스 API 키 설정
- `GET /api/user/{userId}/account` - 바이낸스 계정 정보 조회

### WebSocket
- `/ws` - WebSocket 연결 엔드포인트
- `/topic/market/{symbol}` - 실시간 가격 데이터 구독

## 실행 방법

### 전제 조건
- Java 17 이상
- Maven 3.6 이상
- PostgreSQL 데이터베이스

### 1. 데이터베이스 설정
```yaml
# application.yml에서 데이터베이스 연결 설정
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/binance_trading
    username: your_username
    password: your_password
```

### 2. 애플리케이션 빌드
```bash
mvn clean compile
```

### 3. 애플리케이션 실행
```bash
# Maven을 사용한 실행
mvn spring-boot:run

# 또는 제공된 스크립트 사용
./run-java.sh
```

### 4. 애플리케이션 접속
- 서버: http://localhost:8080
- WebSocket: ws://localhost:8080/ws

## 설정

### 환경 변수
- `SPRING_PROFILES_ACTIVE`: 활성 프로파일 (development, production)
- `SERVER_PORT`: 서버 포트 (기본값: 8080)
- `DATABASE_URL`: PostgreSQL 연결 URL

### 바이낸스 API 설정
```yaml
binance:
  api:
    base-url: https://api.binance.com
```

## 개발 가이드

### 새로운 엔티티 추가
1. `model/` 디렉토리에 JPA 엔티티 클래스 생성
2. `repository/` 디렉토리에 해당 Repository 인터페이스 생성
3. `service/` 디렉토리에 비즈니스 로직 구현
4. `controller/` 디렉토리에 REST API 컨트롤러 추가

### 데이터베이스 마이그레이션
```bash
# JPA가 자동으로 테이블을 생성합니다
# 프로덕션에서는 Flyway 또는 Liquibase 사용 권장
```

## 보안 고려사항

1. **API 키 보안**: 바이낸스 API 키는 암호화되어 저장됩니다
2. **CORS 설정**: 프로덕션에서는 적절한 CORS 정책 설정 필요
3. **인증/인가**: Spring Security 통합 권장

## 트러블슈팅

### 공통 문제
1. **데이터베이스 연결 실패**: PostgreSQL 서비스 상태 확인
2. **바이낸스 API 호출 실패**: API 키 유효성 및 네트워크 연결 확인
3. **WebSocket 연결 실패**: 방화벽 및 프록시 설정 확인

### 로그 확인
```bash
# 애플리케이션 로그
tail -f logs/spring.log

# 또는 실행 중인 터미널에서 직접 확인
```

## 기여 가이드

1. 새로운 기능 추가 시 단위 테스트 작성
2. 코드 스타일: Google Java Style Guide 준수
3. 커밋 메시지: 한국어로 명확하게 작성

## 라이선스

이 프로젝트는 개발 목적으로 제작되었습니다.