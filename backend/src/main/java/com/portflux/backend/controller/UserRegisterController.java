package com.portflux.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.portflux.backend.beans.UserRegisterBean;
import com.portflux.backend.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user/register")
@RequiredArgsConstructor
public class UserRegisterController {

    private final UserService userService;

    @PostMapping("/general")
    public ResponseEntity<String> registerGeneral(@RequestBody UserRegisterBean registerBean) {
        try {
            userService.registerUser(registerBean);
            return ResponseEntity.ok("회원가입 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestBody Map<String, String> request) {
        String nickname = request.get("nickname");
        // userService의 통합 중복 체크를 사용 (양쪽 테이블 모두 확인)
        boolean isDuplicate = userService.isNicknameDuplicate(nickname);
        return ResponseEntity.ok(!isDuplicate); // 중복이 아니어야 true(사용가능)
    }
    
    @PostMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailDuplicate(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean isDuplicate = userService.isEmailDuplicate(email); 
        return ResponseEntity.ok(isDuplicate); // 중복이면 true
    }

    @PostMapping("/check-id")
    public ResponseEntity<Boolean> checkIdDuplicate(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        boolean isDuplicate = userService.isIdDuplicate(userId); 
        return ResponseEntity.ok(isDuplicate); // 중복이면 true
    }
}