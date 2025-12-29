package com.portflux.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; // 추가
import org.springframework.web.bind.annotation.RestController;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.security.JwtTokenProvider;
import com.portflux.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/login")
@RequiredArgsConstructor
public class UserLoginController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 1. 일반 로그인 (아이디/비번)
     * URL 형식: /api/user/login/proc?type=USER 또는 ?type=COMPANY
     */
    @PostMapping("/proc")
    public ResponseEntity<?> login(
            @RequestBody UserLoginBean loginBean, 
            @RequestParam("type") String type) { // [수정] 쿼리 스트링의 type을 받음
        try {
            // Service 로직 호출 (전달받은 type에 따라 USER/COMPANY 분기 처리됨)
            Map<String, Object> result = userService.login(loginBean, type);
            
            // 토큰 생성을 위한 아이디 추출 (UserBean의 userId 혹은 CompanyUserBean의 companyId)
            String loginId = (String) result.get("id");
            String token = jwtTokenProvider.generateToken(loginId);

            // 프론트엔드 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", result.get("role"));
            response.put("memberType", result.get("memberType"));
            response.put("id", result.get("id"));
            response.put("name", result.get("name"));
            response.put("num", result.get("num"));

            // 일반 유저일 경우 UserBean 객체도 함께 전달
            if (result.containsKey("user")) {
                response.put("user", result.get("user"));
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // 로그인 실패 시 400 에러와 함께 메시지 전달
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 2. 구글 소셜 로그인
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String name = body.get("name");
            
            // Service 호출 (가입 여부 판단)
            Map<String, Object> result = userService.processGoogleLogin(email, name);

            boolean isMember = (boolean) result.get("isMember");

            if (isMember) {
                // 기존 회원인 경우
                UserBean user = (UserBean) result.get("user");
                String token = jwtTokenProvider.generateToken(user.getUserId());

                Map<String, Object> response = new HashMap<>();
                response.put("user", user);
                response.put("token", token);
                response.put("status", "SUCCESS");

                return ResponseEntity.ok(response);
            } else {
                // 신규 회원인 경우 (회원가입 페이지로 유도)
                Map<String, Object> response = new HashMap<>();
                response.put("status", "NEW_USER");
                response.put("message", "회원가입이 필요합니다.");
                response.put("email", result.get("email"));
                response.put("name", result.get("name"));
                
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}