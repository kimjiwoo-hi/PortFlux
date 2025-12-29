package com.portflux.backend.config;

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
                // 1. CORS 설정 (프론트엔드 URL 명시)
                .cors(corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {
                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration config = new CorsConfiguration();
                        config.setAllowedOriginPatterns(Collections.singletonList("http://localhost:5173"));
                        config.setAllowedMethods(Collections.singletonList("*"));
                        config.setAllowCredentials(true);
                        config.setAllowedHeaders(Collections.singletonList("*"));
                        return config;
                    }
                }))

                // 2. CSRF 비활성화 (POST/PUT 요청 시 403 에러 방지 핵심)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 설정 (JWT 기반이므로 STATELESS)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. URL 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 회원가입, 아이디 찾기, 로그인 관련 모두 허용
                        .requestMatchers("/user/register/**", "/company/register/**", "/user/find/**").permitAll()
                        .requestMatchers("/api/mail/**", "/user/login/**").permitAll()

                        // 게시판 조회 및 이미지 파일 접근 허용
                        .requestMatchers("/api/boardlookup/**", "/uploads/**").permitAll()

                        // 사용자 정보 조회 허용
                        // ★★★ 게시판 API 허용 (추가) ★★★
                        .requestMatchers("/api/boardlookup/**").permitAll()
                        // PDF AI 분석 API 허용 (추가)
                        .requestMatchers("/api/pdf/**").permitAll()
        
                        // ★★★ 업로드된 파일 접근 허용 (추가) ★★★
                        .requestMatchers("/uploads/**").permitAll()
                        // [추가] 사용자 정보 조회/수정 API 허용
                        .requestMatchers("/user/info/**").permitAll()

                        // [추가] 장바구니 API는 인증된 사용자만 허용
                        .requestMatchers("/api/cart/**").authenticated()
                        // [추가] 주문 API는 인증된 사용자만 허용
                        .requestMatchers("/api/orders/**").authenticated()
                        // [추가] 결제 결과 조회 API 허용
                        .requestMatchers("/api/payments/result").permitAll()

                        // 정적 리소스 허용
                        .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                        // 컨트롤러 매핑 오류(404) 시 시큐리티가 403으로 막지 않도록 에러 경로 허용
                        .requestMatchers("/error").permitAll()
                        // ★★★ [최하위 우선순위] 그 외 모든 요청은 인증 필요 ★★★
                        .anyRequest().authenticated())

                // 5. JWT 필터 추가
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}