package com.portflux.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * BCrypt 해시 생성 유틸리티
 * 실행 방법: 이 클래스의 main 메서드 실행
 */
public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String password = "!Aa123123";
        String hash = encoder.encode(password);

        System.out.println("========================================");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("========================================");

        // 해시 검증
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verification: " + (matches ? "SUCCESS" : "FAILED"));
    }
}
