package com.portflux.backend.api;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.portflux.backend.service.MailService;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class BoardLookupPostDto {

    private final MailService mailService;

    // 1. 인증번호 발송 요청
    @PostMapping("/send")
    public ResponseEntity<String> sendAuthCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("이메일을 입력해주세요.");
        }

        try {
            mailService.sendAuthEmail(email);
            return ResponseEntity.ok("인증번호가 발송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("발송 실패: " + e.getMessage());
        }
    }

    // 2. 인증번호 확인 요청
    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyAuthCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String authCode = request.get("authCode");

        boolean isVerified = mailService.verifyAuthCode(email, authCode);
        return ResponseEntity.ok(isVerified); // true or false 반환
    }
}