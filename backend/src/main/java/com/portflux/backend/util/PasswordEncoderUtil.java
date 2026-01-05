package com.portflux.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoderUtil {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println("\n=== BCrypt 암호화된 비밀번호 (SQL INSERT용) ===\n");

        // admin123!
        String admin = encoder.encode("admin123!");
        System.out.println("admin123! → " + admin);

        // password123!
        String user = encoder.encode("password123!");
        System.out.println("password123! → " + user);

        // comp123!
        String company = encoder.encode("comp123!");
        System.out.println("comp123! → " + company);

        System.out.println("\n위 해시값을 SQL INSERT문에 사용하세요.\n");
    }
}
