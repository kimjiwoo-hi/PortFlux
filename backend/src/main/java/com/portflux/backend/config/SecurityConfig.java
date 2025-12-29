package com.portflux.backend.config;

import java.util.Arrays;
import java.util.Collections;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.portflux.backend.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정
                .cors(corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {
                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration config = new CorsConfiguration();
                        // 프론트엔드 포트 3000과 5173 모두 허용
                        config.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
                        config.setAllowedMethods(Collections.singletonList("*"));
                        config.setAllowCredentials(true);
                        config.setAllowedHeaders(Collections.singletonList("*"));
                        return config;
                    }
                }))

                // 2. CSRF 비활성화 (POST/PUT 요청 시 403 에러 방지 핵심)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 설정 (Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. URL 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 회원가입 및 로그인 관련 모든 경로 허용 (api 포함/미포함 둘 다 대응)
                        .requestMatchers("/api/user/register/**", "/user/register/**").permitAll()
                        .requestMatchers("/api/company/register/**", "/company/register/**").permitAll()
                        .requestMatchers("/api/user/login/**", "/user/login/**").permitAll()
                        .requestMatchers("/api/user/find/**", "/user/find/**").permitAll()
                        .requestMatchers("/api/mail/**", "/mail/**").permitAll()
                        
                        // 게시판 및 공통 정보
                        .requestMatchers("/api/boardlookup/**", "/api/pdf/**").permitAll()
                        .requestMatchers("/api/board/free/**", "/api/board/job/**").permitAll()
                        .requestMatchers("/uploads/**", "/api/jobs/**", "/api/follow/**").permitAll()
                        .requestMatchers("/api/payments/result").permitAll()

                        // 사용자 정보는 인증 필요
                        .requestMatchers("/api/user/info/**").authenticated()

                        // 정적 리소스 및 에러 페이지
                        .requestMatchers("/css/**", "/js/**", "/images/**", "/error").permitAll()

                        // 장바구니와 주문은 인증 필요
                        .requestMatchers("/api/cart/**", "/api/orders/**").authenticated()

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated())

                // 5. JWT 필터 추가
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}