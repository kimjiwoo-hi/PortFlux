package com.portflux.backend.controller;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user/find")
@RequiredArgsConstructor
public class UserFindController {

    private final UserService userService;

    // ★ 아이디 찾기 (이름 + 이메일 정보로 조회)
    // 프론트에서 이메일 인증 완료 후 이 API를 호출합니다.
    @PostMapping("/id")
    public ResponseEntity<String> findId(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        
        // 서비스에서 이름과 이메일로 유저 찾기
        UserBean user = userService.findByNameAndEmail(name, email);
        
        if (user != null) {
            // 유저가 존재하면 아이디 반환
            return ResponseEntity.ok(user.getUserId());
        } else {
            // 없으면 에러 메시지 반환
            return ResponseEntity.badRequest().body("일치하는 회원 정보가 없습니다.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String newPassword = request.get("newPassword");

        try {
            userService.updatePassword(userId, newPassword);
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("비밀번호 변경 실패: " + e.getMessage());
        }
    }
}