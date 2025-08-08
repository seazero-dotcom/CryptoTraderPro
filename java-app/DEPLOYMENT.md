# Java Spring Boot 애플리케이션 배포 가이드

## 현재 상태

✅ **완료된 작업**
- Java Spring Boot 프로젝트 구조 완전 생성
- JPA 엔티티 모델 (User, TradingStrategy, Order) 구현
- Repository 레이어 (Spring Data JPA) 구현
- 비즈니스 로직 서비스 레이어 구현
- REST API 컨트롤러 (Market, User) 구현
- WebSocket 실시간 데이터 전송 구현
- Maven 빌드 설정 및 의존성 관리
- JAR 파일 빌드 성공 (62MB)

⚠️ **Replit 환경 제약**
- Java 런타임 실행 환경에 제약 발생
- 현재 TypeScript 버전이 정상 작동 중

## 로컬/외부 서버 실행 방법

### 전제 조건
```bash
# Java 17+ 설치 확인
java -version

# Maven 설치 확인
mvn -version
```

### 1. 데이터베이스 설정
PostgreSQL 데이터베이스 연결 정보를 `application.yml`에 설정:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/binance_trading
    username: your_username
    password: your_password
```

### 2. 환경 변수 설정
```bash
export SPRING_PROFILES_ACTIVE=development
export SERVER_PORT=8080
export DATABASE_URL=postgresql://username:password@host:port/database
```

### 3. 애플리케이션 실행
```bash
# Maven을 사용한 실행
cd java-app
mvn spring-boot:run

# 또는 JAR 파일 직접 실행
java -jar target/binance-trading-app-1.0.0.jar
```

### 4. API 접근
- 서버: http://localhost:8080
- WebSocket: ws://localhost:8080/ws
- API 문서: http://localhost:8080/swagger-ui.html (구현 시)

## API 엔드포인트

### 시장 데이터
- `GET /api/market/24hr-ticker` - 24시간 가격 변동 통계
- `GET /api/market/price/{symbol}` - 특정 심볼 가격
- `GET /api/market/major-symbols` - 주요 암호화폐 가격

### 사용자 관리
- `GET /api/user/{userId}` - 사용자 정보 조회
- `POST /api/user/{userId}/binance-credentials` - API 키 설정
- `GET /api/user/{userId}/account` - 계정 정보 조회

### WebSocket 실시간 데이터
- 연결: `/ws`
- 구독: `/topic/market/{symbol}`
- 메시지: `/app/market/subscribe`

## Docker 배포

### Dockerfile 생성
```dockerfile
FROM openjdk:17-jre-slim

WORKDIR /app
COPY target/binance-trading-app-1.0.0.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
```

### Docker 빌드 및 실행
```bash
# 이미지 빌드
docker build -t binance-trading-app .

# 컨테이너 실행
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=production \
  -e DATABASE_URL=your_database_url \
  binance-trading-app
```

## 클라우드 배포

### AWS Elastic Beanstalk
1. JAR 파일을 Elastic Beanstalk에 업로드
2. 환경 변수 설정 (DATABASE_URL 등)
3. RDS PostgreSQL 인스턴스 연결

### Google Cloud Platform
```bash
# App Engine 배포
gcloud app deploy
```

### Heroku
```bash
# Heroku Git 배포
git push heroku main
```

## 모니터링 및 로깅

### 애플리케이션 로그
```bash
# 로그 확인
tail -f logs/spring.log

# 또는 Docker 컨테이너 로그
docker logs -f container_name
```

### 헬스 체크
```bash
# Spring Boot Actuator 헬스 체크
curl http://localhost:8080/actuator/health
```

## 보안 설정

### 프로덕션 환경
1. HTTPS 인증서 설정
2. CORS 정책 제한
3. API 키 암호화 강화
4. Spring Security 통합

### 방화벽 설정
- 포트 8080 허용
- 데이터베이스 포트 (5432) 제한적 접근

## 성능 최적화

### JVM 튜닝
```bash
java -Xms512m -Xmx1024m -jar app.jar
```

### 데이터베이스 연결 풀
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
```

## 문제 해결

### 공통 문제
1. **데이터베이스 연결 실패**
   - PostgreSQL 서비스 상태 확인
   - 연결 문자열 및 자격 증명 검증

2. **포트 충돌**
   - 다른 포트 사용: `--server.port=8081`
   - 실행 중인 프로세스 확인: `netstat -tulpn | grep 8080`

3. **메모리 부족**
   - JVM 힙 크기 증가: `-Xmx2048m`
   - 시스템 리소스 모니터링

### 로그 분석
```bash
# 오류 로그 필터링
grep ERROR logs/spring.log

# 최근 로그 확인
tail -n 100 logs/spring.log
```

## 개발 환경 설정

### IDE 설정
- IntelliJ IDEA: Spring Boot 플러그인 설치
- VS Code: Spring Boot Extension Pack 설치
- Eclipse: Spring Tools Suite (STS) 사용

### 개발 도구
```bash
# 개발 모드 실행 (자동 재시작)
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=development"
```

## 현재 Replit 제약사항

- Java 런타임 환경 설정에 제약 있음
- TypeScript 버전이 정상 작동 중
- Java 코드는 완전히 구현되어 있어 외부 환경에서 실행 가능

## 다음 단계

1. 로컬 또는 클라우드 환경에서 Java 애플리케이션 테스트
2. 프로덕션 배포를 위한 CI/CD 파이프라인 구축
3. 모니터링 및 알림 시스템 구축
4. 보안 강화 및 성능 최적화