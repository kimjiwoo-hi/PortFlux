package com.portflux.backend.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;

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

    // Generate a token with additional user information
    public String generateToken(String userId, String userType, Long userNum) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(userId)
                .claim("userType", userType)  // USER or COMPANY
                .claim("userNum", userNum)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    // Get user ID from the token
    public String getUserIdFromToken(String token) {
        // parserBuilder() 대신 최신 버전 호환을 위해 parser()를 지원하는 형태로 작성
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    // Get user type from the token
    public String getUserTypeFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("userType", String.class);
    }

    // Get user number from the token
    public Long getUserNumFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Object userNumObj = claims.get("userNum");
        if (userNumObj == null) return null;

        if (userNumObj instanceof Integer) {
            return ((Integer) userNumObj).longValue();
        } else if (userNumObj instanceof Long) {
            return (Long) userNumObj;
        }
        return null;
    }

    // Get all claims from token
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Validate the token
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