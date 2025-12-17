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

                        // 프론트엔드 URL 명시
                        config.setAllowedOriginPatterns(Collections.singletonList("http://localhost:5173"));

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
                        // 회원가입 관련
                        .requestMatchers("/user/register/check-id").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/user/register/**").permitAll()
                        .requestMatchers("/user/register/**").permitAll()
                        .requestMatchers("/company/register/**").permitAll()
                        
                        // 아이디/비밀번호 찾기
                        .requestMatchers("/user/find/**").permitAll()

                        // 로그인 및 메일 인증
                        .requestMatchers("/api/mail/**").permitAll()
                        .requestMatchers("/user/login/**").permitAll()

                        // [추가] 게시판 API 관련 경로 허용 (이 부분이 없어서 403 발생)
                        .requestMatchers("/api/board/**").permitAll()

                        // [추가] 사용자 정보 조회(헤더 팝오버) 허용
                        .requestMatchers("/user/info/**").permitAll()

                        // 정적 리소스 및 에러 페이지
                        .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated());

        return http.build();
    }
}