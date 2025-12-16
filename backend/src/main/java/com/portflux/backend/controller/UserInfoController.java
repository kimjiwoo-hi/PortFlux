package com.portflux.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user/info")
@RequiredArgsConstructor
public class UserInfoController {

    private final UserService userService;

    // 사용자 정보 조회
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserInfo(@PathVariable String userId) {
        try {
            UserBean user = userService.getUserByUserId(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다.");
            }
            // 비밀번호는 반환하지 않음
            user.setUserPassword(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 사용자 정보 수정
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserInfo(@PathVariable String userId, @RequestBody UserBean updateUser) {
        try {
            userService.updateUserInfo(userId, updateUser);
            return ResponseEntity.ok("정보가 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 비밀번호 변경
    @PutMapping("/{userId}/password")
    public ResponseEntity<?> updatePassword(
            @PathVariable String userId,
            @RequestBody Map<String, String> passwords) {
        try {
            String currentPassword = passwords.get("currentPassword");
            String newPassword = passwords.get("newPassword");

            userService.updatePasswordWithVerification(userId, currentPassword, newPassword);
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
