package com.portflux.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import com.portflux.backend.beans.UserRegisterBean;
import com.portflux.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/register")
@RequiredArgsConstructor
public class UserRegisterController {

    private final UserService userService;

    // 1. 일반 회원가입 요청
    @PostMapping("/general")
    public ResponseEntity<String> registerGeneral(@RequestBody UserRegisterBean registerBean) {
        try {
            userService.registerUser(registerBean);
            return ResponseEntity.ok("회원가입 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // 2. 닉네임 중복 확인
    @PostMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestBody Map<String, String> request) {
        String nickname = request.get("nickname");
        boolean isAvailable = userService.isNicknameAvailable(nickname);
        return ResponseEntity.ok(isAvailable);
    }
    
    // 3. 이메일 중복 확인
    @PostMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailDuplicate(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean isDuplicate = userService.isEmailDuplicate(email); 
        return ResponseEntity.ok(isDuplicate);
    }

    // 4. ★ 아이디 중복 확인 API (추가됨)
    @PostMapping("/check-id")
    public ResponseEntity<Boolean> checkIdDuplicate(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        boolean isDuplicate = userService.isIdDuplicate(userId); 
        return ResponseEntity.ok(isDuplicate);
    }
}