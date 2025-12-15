package com.portflux.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user/login")
@RequiredArgsConstructor
public class UserLoginController {

    private final UserService userService;

    // 일반 로그인 (아이디/비번)
    @PostMapping("/proc")
    public ResponseEntity<?> login(@RequestBody UserLoginBean loginBean) {
        try {
            UserBean user = userService.login(loginBean);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 구글 로그인
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        try {
            String authCode = body.get("code");
            UserBean user = userService.processGoogleLogin(authCode);

            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("status", "NEW_USER");
                response.put("message", "회원가입이 필요합니다.");
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}