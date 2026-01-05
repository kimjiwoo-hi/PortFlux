package com.portflux.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePasswords {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println("=== BCrypt 암호화된 비밀번호 ===");
        System.out.println();

        // admin123! 암호화
        String admin = encoder.encode("admin123!");
        System.out.println("admin123! → " + admin);

        // password123! 암호화
        String user = encoder.encode("password123!");
        System.out.println("password123! → " + user);

        // comp123! 암호화
        String company = encoder.encode("comp123!");
        System.out.println("comp123! → " + company);

        System.out.println();
        System.out.println("=== SQL INSERT용 ===");
        System.out.println("-- admin123!: '" + admin + "'");
        System.out.println("-- password123!: '" + user + "'");
        System.out.println("-- comp123!: '" + company + "'");
    }
}
