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

                        // ★★★ [수정 핵심] 와일드카드 대신 프론트엔드 URL 명시 ★★★
                        // 프론트엔드가 5173 포트를 사용하므로 명시합니다.
                        config.setAllowedOriginPatterns(Collections.singletonList("http://localhost:5173"));

                        config.setAllowedMethods(Collections.singletonList("*"));
                        config.setAllowCredentials(true);
                        config.setAllowedHeaders(Collections.singletonList("*"));
                        return config;
                    }
                }))

                // 2. CSRF 비활성화
                .csrf(csrf -> csrf.disable())

                // 3. 세션 설정
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. URL 권한 설정 (가장 중요)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/user/register/check-id").permitAll()
                    
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/user/register/**").permitAll()
                        .requestMatchers("/user/register/**").permitAll()
                        .requestMatchers("/company/register/**").permitAll()
                        // [추가] 아이디 찾기 API 허용
                        .requestMatchers("/user/find/**").permitAll()

                        // API 및 로그인 관련 경로 허용
                        .requestMatchers("/api/mail/**").permitAll()
                        .requestMatchers("/user/login/**").permitAll()

                        // [추가] 사용자 정보 조회/수정 API 허용
                        .requestMatchers("/user/info/**").permitAll()

                        // 정적 리소스 허용
                        .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                        // 컨트롤러 매핑 오류(404) 시 시큐리티가 403으로 막지 않도록 에러 경로 허용
                        .requestMatchers("/error").permitAll()
                        // ★★★ [최하위 우선순위] 그 외 모든 요청은 인증 필요 ★★★
                        .anyRequest().authenticated());

        return http.build();
    }
}