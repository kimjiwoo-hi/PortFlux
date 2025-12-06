package com.portflux.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. 암호화 도구 등록 (Service에서 사용)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. 보안 필터 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화 (REST API 방식이므로 비활성화)
                .csrf((csrf) -> csrf.disable())

                // 세션 관리 정책 설정 (Stateless: 세션을 서버에 저장하지 않음 - JWT 사용 시 필수)
                // 만약 JWT가 아니라 세션 로그인을 쓴다면 이 부분은 빼도 됨
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // URL별 접근 권한 설정
                .authorizeHttpRequests((auth) -> auth
                        // 로그인, 회원가입 관련 URL은 모두 허용
                        .requestMatchers("/user/login/**").permitAll()
                        .requestMatchers("/user/register/**").permitAll()
                        .requestMatchers("/company/register/**").permitAll()

                        // 정적 리소스(이미지, css 등) 허용
                        .requestMatchers("/css/**").permitAll()
                        .requestMatchers("/js/**").permitAll()
                        .requestMatchers("/images/**").permitAll()

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated());

        return http.build();
    }
}