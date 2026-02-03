# JWT 보안 개선 가이드

## ✅ 완료된 보안 개선

### 1. JWT Secret Key 고정
**문제:** 서버 재시작할 때마다 JWT Secret Key가 랜덤 생성되어 모든 사용자 강제 로그아웃됨

**해결:**
```java
// JwtTokenProvider.java
@Value("${jwt.secret}")
private String jwtSecret;

@PostConstruct
public void init() {
    this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
}
```

```properties
# application.properties
jwt.secret=PortFlux-2024-Secure-JWT-Secret-Key-For-Production-Must-Be-At-Least-512-Bits-Long-Do-Not-Share-This-Key
jwt.expiration=86400000
```

**효과:**
- ✅ 서버 재시작해도 기존 JWT 계속 유효
- ✅ 사용자 경험 개선

---

## 🔄 추가 보안 개선 (선택사항)

### 2. Refresh Token 구현 (권장)

**현재 문제:**
- Access Token이 24시간 유효 → 탈취 시 24시간 동안 악용 가능
- 강제 로그아웃 불가능 (토큰이 만료될 때까지 유효)

**개선 방안:**

#### 2.1 Refresh Token 테이블 생성

```sql
CREATE TABLE REFRESH_TOKEN (
    TOKEN_ID NUMBER PRIMARY KEY,
    USER_NUM NUMBER NOT NULL,
    TOKEN VARCHAR2(500) NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EXPIRES_AT TIMESTAMP NOT NULL,
    CONSTRAINT FK_REFRESH_TOKEN_USER FOREIGN KEY (USER_NUM) REFERENCES USERS(USER_NUM) ON DELETE CASCADE
);

CREATE SEQUENCE REFRESH_TOKEN_SEQ START WITH 1 INCREMENT BY 1;
```

#### 2.2 JwtTokenProvider 수정

```java
// Access Token 생성 (짧은 수명)
public String generateAccessToken(String userId) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + 900000); // 15분

    return Jwts.builder()
            .setSubject(userId)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(jwtSecretKey, SignatureAlgorithm.HS512)
            .compact();
}

// Refresh Token 생성 (긴 수명)
public String generateRefreshToken(String userId) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + 604800000); // 7일

    return Jwts.builder()
            .setSubject(userId)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(jwtSecretKey, SignatureAlgorithm.HS512)
            .compact();
}
```

#### 2.3 로그인 시 두 토큰 모두 반환

```java
// UserLoginController.java
@PostMapping("/proc")
public ResponseEntity<?> login(@RequestBody UserLoginBean loginBean) {
    try {
        UserBean user = userService.login(loginBean);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getUserId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());

        // Refresh Token을 DB에 저장
        refreshTokenService.saveRefreshToken(user.getUserNum(), refreshToken);

        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);

        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
```

#### 2.4 토큰 재발급 엔드포인트

```java
@PostMapping("/refresh")
public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
    String refreshToken = request.get("refreshToken");

    // 1. Refresh Token 유효성 검증
    if (!jwtTokenProvider.validateToken(refreshToken)) {
        return ResponseEntity.status(401).body("Invalid refresh token");
    }

    // 2. DB에 저장된 토큰과 일치하는지 확인
    String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
    if (!refreshTokenService.isValidRefreshToken(userId, refreshToken)) {
        return ResponseEntity.status(401).body("Refresh token not found");
    }

    // 3. 새 Access Token 발급
    String newAccessToken = jwtTokenProvider.generateAccessToken(userId);

    return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
}
```

#### 2.5 프론트엔드 자동 재발급

```javascript
// api.js - 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access Token 만료 시 (401 에러)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userStr = localStorage.getItem("user");
        const user = JSON.parse(userStr);
        const refreshToken = user.refreshToken;

        // Refresh Token으로 새 Access Token 받기
        const response = await axios.post('/api/user/login/refresh', {
          refreshToken
        });

        const newAccessToken = response.data.accessToken;

        // 새 토큰 저장
        user.token = newAccessToken;
        localStorage.setItem("user", JSON.stringify(user));

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료됨 → 로그인 페이지로
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**효과:**
- ✅ Access Token 탈취 피해 최소화 (15분만 유효)
- ✅ Refresh Token을 DB에 저장하여 강제 로그아웃 가능
- ✅ 사용자 경험 저하 없음 (자동 재발급)

---

### 3. HTTPS 사용 (배포 시 필수)

**현재:** HTTP 사용 → JWT 탈취 가능

**개선:**
```nginx
# Nginx 설정 예시
server {
    listen 443 ssl;
    server_name portflux.com;

    ssl_certificate /etc/ssl/certs/portflux.crt;
    ssl_certificate_key /etc/ssl/private/portflux.key;

    location / {
        proxy_pass http://localhost:5173;
    }

    location /api {
        proxy_pass http://localhost:8080;
    }
}
```

**효과:**
- ✅ 네트워크 상에서 JWT 암호화됨
- ✅ 중간자 공격(MITM) 방지

---

### 4. JWT Blacklist (로그아웃 구현)

**현재 문제:** 로그아웃해도 JWT는 만료 전까지 유효

**개선 방안:**

```java
// Redis를 사용한 Blacklist
@Service
public class JwtBlacklistService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    // 로그아웃 시 토큰을 블랙리스트에 추가
    public void addToBlacklist(String token, long expirationTime) {
        long ttl = expirationTime - System.currentTimeMillis();
        redisTemplate.opsForValue().set(
            "blacklist:" + token,
            "true",
            ttl,
            TimeUnit.MILLISECONDS
        );
    }

    // 토큰이 블랙리스트에 있는지 확인
    public boolean isBlacklisted(String token) {
        return redisTemplate.hasKey("blacklist:" + token);
    }
}
```

```java
// JwtAuthenticationFilter에 추가
if (StringUtils.hasText(jwt) &&
    tokenProvider.validateToken(jwt) &&
    !jwtBlacklistService.isBlacklisted(jwt)) {  // ← 추가
    // 인증 처리
}
```

**효과:**
- ✅ 로그아웃하면 토큰 즉시 무효화
- ✅ 탈취된 토큰 강제 차단 가능

---

### 5. 환경변수로 Secret 관리 (배포 시 권장)

**현재:** application.properties에 하드코딩

**개선:**

```bash
# 환경변수 설정
export JWT_SECRET="PortFlux-2024-Secure-JWT-Secret-Key-..."
export DB_PASSWORD="12345"
export GMAIL_PASSWORD="etunfgcpprunpybk"
```

```properties
# application.properties
jwt.secret=${JWT_SECRET}
spring.datasource.password=${DB_PASSWORD}
spring.mail.password=${GMAIL_PASSWORD}
```

**효과:**
- ✅ Git에 민감 정보 노출 방지
- ✅ 서버별로 다른 키 사용 가능

---

## 📊 보안 수준 비교

| 항목 | 현재 (개선 전) | 개선 후 |
|------|---------------|---------|
| Secret Key | ❌ 랜덤 생성 | ✅ 고정 |
| Access Token 수명 | ⚠️ 24시간 | ✅ 15분 (Refresh 사용 시) |
| 강제 로그아웃 | ❌ 불가능 | ✅ 가능 (Blacklist) |
| HTTPS | ❌ 미사용 | ✅ 사용 (배포 시) |
| 환경변수 관리 | ❌ 하드코딩 | ✅ 환경변수 |

---

## 🎯 우선순위

### 학원 프로젝트 (현재)
1. ✅ **Secret Key 고정** (완료)
2. ⭐ **Refresh Token 추가** (선택, 발표 시 가산점)
3. 나머지는 선택사항

### 실제 배포 시
1. ✅ **Secret Key 고정** (필수)
2. ✅ **Refresh Token** (필수)
3. ✅ **HTTPS** (필수)
4. ✅ **환경변수 관리** (필수)
5. ✅ **JWT Blacklist** (권장)

---

## 📝 참고 자료

- [JWT 공식 사이트](https://jwt.io/)
- [Spring Security + JWT 가이드](https://spring.io/guides/tutorials/spring-boot-oauth2/)
- [OWASP JWT 보안 가이드](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
