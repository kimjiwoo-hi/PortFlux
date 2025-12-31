package com.portflux.backend.controller;

import com.portflux.backend.api.GoogleApi;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.security.JwtTokenProvider;
import com.portflux.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private GoogleApi googleApi; // GoogleApi 컴포넌트 주입

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * 1. 일반 로그인 처리
     */
    @PostMapping("/login/proc")
    public ResponseEntity<?> login(@RequestBody UserLoginBean loginBean, @RequestParam("type") String type, jakarta.servlet.http.HttpSession session) {
        try {
            System.out.println("=== 로그인 요청 ===");
            System.out.println("로그인 타입: " + type);
            System.out.println("사용자 ID: " + loginBean.getUserId());

            Map<String, Object> loginResult = userService.login(loginBean, type);
            System.out.println("로그인 결과: " + loginResult);

            // JWT 토큰 생성
            String userId = (String) loginResult.get("id");
            Long userNum = ((Number) loginResult.get("num")).longValue();
            String userType = "USER".equals(type) ? "USER" : "COMPANY";

            System.out.println("토큰 생성 정보 - userId: " + userId + ", userType: " + userType + ", userNum: " + userNum);

            String token = jwtTokenProvider.generateToken(userId, userType, userNum);
            System.out.println("생성된 토큰: " + token.substring(0, Math.min(50, token.length())) + "...");

            loginResult.put("token", token);
            System.out.println("토큰이 응답에 추가됨");

            // 세션에 사용자 정보 저장
            if ("USER".equals(type)) {
                session.setAttribute("userNum", loginResult.get("num"));
                session.setAttribute("userId", loginResult.get("id"));
                session.setAttribute("userName", loginResult.get("name"));
                session.setAttribute("role", loginResult.get("role"));
                session.setAttribute("memberType", "user");
                System.out.println("세션에 USER 정보 저장");
            } else if ("COMPANY".equals(type)) {
                session.setAttribute("companyNum", loginResult.get("num"));
                session.setAttribute("companyId", loginResult.get("id"));
                session.setAttribute("companyName", loginResult.get("name"));
                session.setAttribute("role", "COMPANY");
                session.setAttribute("memberType", "company");
                System.out.println("세션에 COMPANY 정보 저장 - companyNum: " + loginResult.get("num"));
            }

            System.out.println("✅ 로그인 성공 응답 반환");
            return ResponseEntity.ok(loginResult);
        } catch (Exception e) {
            System.out.println("❌ 로그인 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * 2. 구글 로그인 처리 (수정됨)
     * 리액트에서 보낸 'code'를 사용하여 구글로부터 정보를 가져옵니다.
     */
    @PostMapping("/login/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request, jakarta.servlet.http.HttpSession session) {
        try {
            String authCode = request.get("code");
            if (authCode == null || authCode.isEmpty()) {
                return ResponseEntity.badRequest().body("인증 코드가 누락되었습니다.");
            }

            // [STEP 1] 구글에 인증 코드를 보내 Access Token 획득
            String accessToken = googleApi.getAccessToken(authCode);
            if (accessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("구글 토큰 획득 실패");
            }

            // [STEP 2] Access Token으로 구글 유저 정보(이메일, 이름 등) 가져오기
            Map<String, Object> userInfo = googleApi.getUserInfo(accessToken);
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");

            // [STEP 3] DB 가입 여부 확인 및 분기 처리 로직 호출
            Map<String, Object> loginResult = userService.processGoogleLogin(email, name);

            // 세션에 사용자 정보 저장 (성공 시에만)
            if ("SUCCESS".equals(loginResult.get("status"))) {
                if (loginResult.containsKey("user")) {
                    // 일반 유저 로그인
                    com.portflux.backend.beans.UserBean user = (com.portflux.backend.beans.UserBean) loginResult.get("user");
                    session.setAttribute("userNum", user.getUserNum());
                    session.setAttribute("userId", user.getUserId());
                    session.setAttribute("userName", user.getUserNickname());
                    session.setAttribute("role", "USER");
                    session.setAttribute("memberType", "user");
                } else if (loginResult.containsKey("company")) {
                    // 기업 유저 로그인
                    com.portflux.backend.beans.CompanyUserBean company = (com.portflux.backend.beans.CompanyUserBean) loginResult.get("company");
                    session.setAttribute("companyNum", company.getCompanyNum());
                    session.setAttribute("companyId", company.getCompanyId());
                    session.setAttribute("companyName", company.getCompanyName());
                    session.setAttribute("role", "COMPANY");
                    session.setAttribute("memberType", "company");
                }
            }

            return ResponseEntity.ok(loginResult);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("구글 로그인 처리 중 서버 오류: " + e.getMessage());
        }
    }

    /**
     * 관리자 비번 암호화 확인용
     */
    @GetMapping("/setup-admin")
    public String setupAdmin() {
        String encodedPw = passwordEncoder.encode("admin123!");
        return "콘솔창을 확인하고 암호화된 값을 DB에 넣으세요: " + encodedPw;
    }

    /**
     * 아이디로 유저 정보 조회
     */
    @GetMapping("/info/{userId}")
    public ResponseEntity<UserBean> getUserInfo(@PathVariable("userId") String userId) {
        UserBean user = userService.getUserInfo(userId);
        if (user != null) {
            user.setUserPw(null); 
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * 유저 번호로 정보 조회
     */
    @GetMapping("/info/num/{userNum}")
    public ResponseEntity<UserBean> getUserInfoByNum(@PathVariable("userNum") int userNum) {
        UserBean user = userService.getUserInfoByNum(userNum);
        if (user != null) {
            user.setUserPw(null); 
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }
}