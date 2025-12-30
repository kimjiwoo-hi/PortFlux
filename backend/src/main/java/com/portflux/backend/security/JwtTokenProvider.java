package com.portflux.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret:portflux-default-secret-key-minimum-512-bits-required-for-hs512-algorithm-security}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs; // 기본값: 24시간

    private SecretKey jwtSecretKey;

    // SecretKey 초기화 (Bean 생성 후 자동 호출)
    @jakarta.annotation.PostConstruct
    public void init() {
        // application.properties의 jwt.secret을 SecretKey로 변환
        this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // 토큰 생성
    public String generateToken(String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    // 토큰에서 아이디 추출
    public String getUserIdFromToken(String token) {
        // parserBuilder() 대신 최신 버전 호환을 위해 parser()를 지원하는 형태로 작성
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    // 토큰 유효성 검증
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(jwtSecretKey)
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException ex) {
            logger.error("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException ex) {
            logger.error("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException ex) {
            logger.error("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT 토큰이 비어있습니다.");
        }
        return false;
    }
}