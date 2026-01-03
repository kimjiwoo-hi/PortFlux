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
import com.portflux.backend.beans.CompanyUserBean;
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
            System.out.println(">>> 로그인 시도: ID=" + loginBean.getUserId() + ", Type=" + type);

            // Service 로직 호출 (전달받은 type에 따라 USER/COMPANY 분기 처리됨)
            Map<String, Object> result = userService.login(loginBean, type);

            // 토큰 생성을 위한 정보 추출
            String loginId = (String) result.get("id");
            Long userNum = ((Number) result.get("num")).longValue();
            String userType = "USER".equals(type) ? "USER" : "COMPANY";

            // userType과 userNum을 포함한 JWT 토큰 생성
            String token = jwtTokenProvider.generateToken(loginId, userType, userNum);

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

            System.out.println(">>> 로그인 성공: " + loginId);
            System.out.println(">>> JWT 토큰 생성: userType=" + userType + ", userNum=" + userNum);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // 로그인 실패 시 400 에러와 함께 메시지 전달
            System.err.println(">>> 로그인 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 2. 구글 소셜 로그인
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        try {
            String authCode = body.get("code");

            if (authCode == null || authCode.isEmpty()) {
                return ResponseEntity.badRequest().body("Authorization code is missing");
            }

            // Google API를 통해 사용자 정보 가져오기는 Service에서 처리
            Map<String, Object> result = userService.processGoogleLoginWithCode(authCode);

            boolean isMember = (boolean) result.get("isMember");

            if (isMember) {
                // 기존 회원인 경우
                UserBean user = (UserBean) result.get("user");
                CompanyUserBean company = (CompanyUserBean) result.get("company");

                Map<String, Object> response = new HashMap<>();

                if (user != null) {
                    // 일반 회원
                    String token = jwtTokenProvider.generateToken(user.getUserId());
                    response.put("user", user);
                    response.put("token", token);
                    response.put("status", "SUCCESS");
                    response.put("role", "USER");
                    response.put("memberType", "user");
                } else if (company != null) {
                    // 기업 회원
                    String token = jwtTokenProvider.generateToken(company.getCompanyId());
                    response.put("token", token);
                    response.put("status", "SUCCESS");
                    response.put("role", "COMPANY");
                    response.put("memberType", "company");
                    response.put("id", company.getCompanyId());
                    response.put("name", company.getCompanyName());
                    response.put("num", company.getCompanyNum());
                }

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
            e.printStackTrace();
            return ResponseEntity.badRequest().body("구글 로그인 처리 중 오류: " + e.getMessage());
        }
    }
}