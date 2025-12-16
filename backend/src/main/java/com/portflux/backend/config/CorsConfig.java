package com.portflux.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

<<<<<<< HEAD
// CorsConfig.java 파일 내부
=======

>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
<<<<<<< HEAD
                // ★★★ [수정 핵심] 와일드카드 대신 프론트엔드 URL 명시 ★★★
=======
               
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
                .allowedOriginPatterns("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}