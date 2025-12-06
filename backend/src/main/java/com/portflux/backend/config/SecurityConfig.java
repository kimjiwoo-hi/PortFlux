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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // [1] CORS 설정 수정 (핵심 부분!)
                .cors(corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {
                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration config = new CorsConfiguration();
                        
                        // ★ 여기가 문제의 원인이었습니다! ★
                        // setAllowedOrigins("*")는 Credentials(true)와 같이 못 씁니다.
                        // 대신 setAllowedOriginPatterns("*")를 쓰면 해결됩니다!
                        config.setAllowedOriginPatterns(Collections.singletonList("*")); 
                        
                        config.setAllowedMethods(Collections.singletonList("*")); // 모든 메소드 허용
                        config.setAllowCredentials(true); // 인증 정보 허용
                        config.setAllowedHeaders(Collections.singletonList("*")); // 모든 헤더 허용
                        config.setMaxAge(3600L); 
                        return config;
                    }
                }))

                // [2] CSRF 비활성화
                .csrf((csrf) -> csrf.disable())

                // [3] 세션 미사용
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // [4] URL 권한 설정
                .authorizeHttpRequests((auth) -> auth
                        .requestMatchers("/user/login/**", "/user/register/**", "/company/register/**").permitAll()
                        .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                        .anyRequest().authenticated());

        return http.build();
    }
}