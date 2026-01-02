package com.portflux.backend.controller;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.CompanyUserBean;
import com.portflux.backend.service.UserService;
import com.portflux.backend.mapper.CompanyUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/find")
@RequiredArgsConstructor
public class UserFindController {

    private final UserService userService;
    private final CompanyUserMapper companyUserMapper;
    private final PasswordEncoder passwordEncoder;

    // ★ 아이디 찾기 (이름 + 이메일 정보로 조회)
    // 프론트에서 이메일 인증 완료 후 이 API를 호출합니다.
    @PostMapping("/id")
    public ResponseEntity<String> findId(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");

        // 1. 먼저 일반 유저에서 찾기
        UserBean user = userService.findByNameAndEmail(name, email);
        if (user != null) {
            return ResponseEntity.ok(user.getUserId());
        }

        // 2. 없으면 기업 회원에서 찾기
        CompanyUserBean company = companyUserMapper.findByCompanyNameAndEmail(name, email);
        if (company != null) {
            return ResponseEntity.ok(company.getCompanyId());
        }

        return ResponseEntity.badRequest().body("일치하는 회원 정보가 없습니다.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String id = request.get("userId");
        String newPassword = request.get("newPassword");

        try {
            // 1. 먼저 일반 유저에서 찾기
            UserBean user = userService.getUserByUserId(id);
            if (user != null) {
                userService.updatePassword(id, newPassword);
                return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
            }

            // 2. 없으면 기업 회원에서 찾기
            CompanyUserBean company = companyUserMapper.getCompanyUserInfo(id);
            if (company != null) {
                String encodedPassword = passwordEncoder.encode(newPassword);
                companyUserMapper.updateCompanyPassword(id, encodedPassword);
                return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
            }

            return ResponseEntity.badRequest().body("일치하는 회원 정보가 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("비밀번호 변경 실패: " + e.getMessage());
        }
    }
}