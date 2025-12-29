package com.portflux.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.dto.UserInfoResponse;
import com.portflux.backend.dto.UserInfoUpdateRequest;
import com.portflux.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/info")
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
            // DTO로 변환하여 반환 (비밀번호 제외, 이미지는 Base64로 변환)
            UserInfoResponse response = UserInfoResponse.fromEntity(user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 사용자 정보 수정
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserInfo(@PathVariable String userId, @RequestBody UserInfoUpdateRequest request) {
        try {
            // DTO를 UserBean으로 변환
            UserBean updateUser = new UserBean();
            updateUser.setUserName(request.getUserName());
            updateUser.setUserNickname(request.getUserNickname());
            updateUser.setUserEmail(request.getUserEmail());
            updateUser.setUserPhone(request.getUserPhone());

            // 이미지 업데이트 플래그
            boolean updateImage = false;
            boolean updateBanner = false;

            // Base64 이미지 처리
            if (request.getUserImage() != null) {
                updateImage = true;
                if (request.getUserImage().isEmpty()) {
                    // 빈 문자열이면 null로 설정 (기본 이미지로 표시)
                    updateUser.setUserImage(null);
                } else {
                    updateUser.setUserImageBase64(request.getUserImage());
                }
            }
            if (request.getUserBanner() != null) {
                updateBanner = true;
                if (request.getUserBanner().isEmpty()) {
                    // 빈 문자열이면 null로 설정 (기본 배너로 표시)
                    updateUser.setUserBanner(null);
                } else {
                    updateUser.setUserBannerBase64(request.getUserBanner());
                }
            }

            userService.updateUserInfo(userId, updateUser, updateImage, updateBanner);
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