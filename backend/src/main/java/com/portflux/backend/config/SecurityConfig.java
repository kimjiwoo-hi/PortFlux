package com.portflux.backend.config;

import java.util.Arrays;
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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정
                .cors(corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {
                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration config = new CorsConfiguration();
                        config.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
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
                        // 회원가입 및 로그인, 아이디/비번 찾기 등 사용자 인증 관련
                        .requestMatchers("/user/register/**", "/user/login/**", "/user/find/**").permitAll()
                        .requestMatchers("/company/**").permitAll() // 기업 회원가입, 로그인 등 모두 허용

                        // [추가] 관리자 계정 설정을 위한 임시 경로 허용
                        .requestMatchers("/user/setup-admin").permitAll()
                        
                        // 메일 인증
                        .requestMatchers("/api/mail/**").permitAll()

                        // 게시판 관련
                        .requestMatchers("/board/**").permitAll()
                        .requestMatchers("/api/board/**").permitAll()

                        // 사용자 정보 조회
                        .requestMatchers("/user/info/**").permitAll()

                        // 정적 리소스 및 공통 항목
                        .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()
                        
                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated());

        return http.build();
    }
}