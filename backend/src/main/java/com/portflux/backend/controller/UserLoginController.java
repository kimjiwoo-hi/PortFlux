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
import com.portflux.backend.security.JwtTokenProvider;
import com.portflux.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user/login")
@RequiredArgsConstructor
public class UserLoginController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    // 일반 로그인 (아이디/비번)
    @PostMapping("/proc")
    public ResponseEntity<?> login(@RequestBody UserLoginBean loginBean) {
        try {
            UserBean user = userService.login(loginBean);
            String token = jwtTokenProvider.generateToken(user.getUserId());

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ★ [수정] 구글 로그인
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        try {
            String authCode = body.get("code");
            
            // Service가 Map을 리턴합니다 (isMember, user, email, name 포함)
            Map<String, Object> result = userService.processGoogleLogin(authCode);

            boolean isMember = (boolean) result.get("isMember");

            if (isMember) {
                // 기존 회원 -> UserBean과 함께 토큰 발급
                UserBean user = (UserBean) result.get("user");
                String token = jwtTokenProvider.generateToken(user.getUserId());

                Map<String, Object> response = new HashMap<>();
                response.put("user", user);
                response.put("token", token);

                return ResponseEntity.ok(response);
            } else {
                // 신규 회원 -> "NEW_USER" 상태와 구글 정보(email, name) 리턴
                Map<String, Object> response = new HashMap<>();
                response.put("status", "NEW_USER");
                response.put("message", "회원가입이 필요합니다.");
                response.put("email", result.get("email")); // 프론트로 이메일 전달
                response.put("name", result.get("name"));   // 프론트로 이름 전달
                
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}