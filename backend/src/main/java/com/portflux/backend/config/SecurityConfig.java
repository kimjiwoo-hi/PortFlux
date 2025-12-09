package com.portflux.backend.config;

import java.util.Collections;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 비밀번호 암호화 빈 등록 (필수)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS 설정 (Security 필터 레벨)
            .cors(corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {
                @Override
                public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                    CorsConfiguration config = new CorsConfiguration();
                    
                    // Credentials 허용 시 '*' 대신 allowedOriginPatterns 사용 필수
                    config.setAllowedOriginPatterns(Collections.singletonList("*")); 
                    
                    config.setAllowedMethods(Collections.singletonList("*")); 
                    config.setAllowCredentials(true); 
                    config.setAllowedHeaders(Collections.singletonList("*")); 
                    return config;
                }
            }))
            
            // 2. CSRF 비활성화 (REST API 방식이므로 불필요)
            .csrf(csrf -> csrf.disable())
            
            // 3. 세션 설정 (JWT 등 토큰 방식 사용 시 STATELESS 권장)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 4. URL 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 기업 회원가입 및 중복확인 관련 API 허용
                .requestMatchers("/company/register/**").permitAll()
                // 사용자 로그인/회원가입 관련 API 허용
                .requestMatchers("/user/login/**", "/user/register/**").permitAll()
                // 정적 리소스(CSS, JS, 이미지) 허용
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                // 그 외 모든 요청은 인증 필요
                .anyRequest().authenticated()
            );

        return http.build();
    }
}