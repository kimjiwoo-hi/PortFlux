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

                // 2. CSRF 비활성화
                .csrf(csrf -> csrf.disable())

                // 3. 세션 설정 (Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. URL 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // [추가] 사용자 회원가입 관련 API 허용
                        .requestMatchers("/api/user/register/**").permitAll()
                        // [추가] 기업 회원가입 관련 API 허용
                        .requestMatchers("/api/company/register/**").permitAll()
                        // [추가] 아이디/비밀번호 찾기 API 허용
                        .requestMatchers("/api/user/find/**").permitAll()

                        // API 및 로그인 관련 경로 허용
                        .requestMatchers("/api/mail/**").permitAll()
                        .requestMatchers("/api/user/login/**").permitAll()


                        // ★★★ 게시판 API 허용 (추가) ★★★
                        .requestMatchers("/api/boardlookup/**").permitAll()
                        // PDF AI 분석 API 허용 (추가)
                        .requestMatchers("/api/pdf/**").permitAll()
        
                        // ★★★ 업로드된 파일 접근 허용 (추가) ★★★
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/user/info/**").permitAll()

                        // [추가] 장바구니 API는 인증 불필요 (컨트롤러에서 Principal 확인)
                        .requestMatchers("/api/cart/**").permitAll()
                        // [추가] 주문 API는 인증된 사용자만 허용
                        .requestMatchers("/api/orders/**").authenticated()
                        // [추가] 결제 결과 조회 API 허용
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