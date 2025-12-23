package com.portflux.backend.controller;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // [추가]
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder; // [추가] 컴파일 에러 해결의 핵심

    // 1. 로그인 처리 (일반유저/관리자 통합)
    @PostMapping("/login/proc")
    public ResponseEntity<?> login(@RequestBody UserLoginBean loginBean) {
        try {
            Map<String, Object> loginResult = userService.login(loginBean);
            return ResponseEntity.ok(loginResult);
        } catch (Exception e) {
            // 401 Unauthorized를 반환하여 프론트에서 에러 메시지를 띄우게 함
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // [임시 기능] 브라우저에서 http://localhost:8080/user/setup-admin 접속 시 실행
    // 관리자 비번 암호화 값을 확인하기 위한 용도입니다.
   @GetMapping("/setup-admin")
public String setupAdmin() {
    // 내 서버가 직접 만드는 admin123!의 암호화 값
    String encodedPw = passwordEncoder.encode("admin123!");
    System.out.println("### [복사하세요] ###");
    System.out.println(encodedPw);
    System.out.println("###################");
    return "콘솔창을 확인하고 암호화된 값을 DB에 넣으세요: " + encodedPw;
}

    @GetMapping("/info/{userId}")
    public ResponseEntity<UserBean> getUserInfo(@PathVariable("userId") String userId) {
        UserBean user = userService.getUserInfo(userId);
        if (user != null) {
            user.setUserPw(null); 
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

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