package com.portflux.backend.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.portflux.backend.beans.CompanyUserBean;
import com.portflux.backend.mapper.CompanyUserMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/company/info")
@RequiredArgsConstructor
public class CompanyInfoController {

    private final CompanyUserMapper companyUserMapper;

    // 기업 회원 정보 조회
    @GetMapping("/{companyId}")
    public ResponseEntity<?> getCompanyInfo(@PathVariable String companyId) {
        try {
            CompanyUserBean company = companyUserMapper.getCompanyUserInfo(companyId);
            if (company == null) {
                return ResponseEntity.badRequest().body("기업 정보를 찾을 수 없습니다.");
            }

            // 응답 데이터 구성 (비밀번호 제외)
            Map<String, Object> response = new HashMap<>();
            response.put("companyNum", company.getCompanyNum());
            response.put("companyId", company.getCompanyId());
            response.put("companyName", company.getCompanyName());
            response.put("companyPhone", company.getCompanyPhone());
            response.put("companyEmail", company.getCompanyEmail());
            response.put("businessNumber", company.getBusinessNumber());
            response.put("companyCreateAt", company.getCompanyCreateAt());
            response.put("companyImage", company.getCompanyImage());
            response.put("companyBanner", company.getCompanyBanner());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 기업 회원 정보 수정
    @PutMapping("/{companyId}")
    public ResponseEntity<?> updateCompanyInfo(
            @PathVariable String companyId,
            @RequestBody Map<String, Object> request) {
        try {
            CompanyUserBean company = companyUserMapper.getCompanyUserInfo(companyId);
            if (company == null) {
                return ResponseEntity.badRequest().body("기업 정보를 찾을 수 없습니다.");
            }

            // 수정 가능한 필드 업데이트
            String companyName = (String) request.get("companyName");
            String companyPhone = (String) request.get("companyPhone");
            String companyImage = (String) request.get("companyImage");
            String companyBanner = (String) request.get("companyBanner");

            // 이미지 Base64 처리
            byte[] imageBytes = null;
            byte[] bannerBytes = null;
            boolean updateImage = request.containsKey("companyImage");
            boolean updateBanner = request.containsKey("companyBanner");

            if (updateImage && companyImage != null && !companyImage.isEmpty()) {
                String base64Data = companyImage;
                if (base64Data.contains(",")) {
                    base64Data = base64Data.split(",")[1];
                }
                imageBytes = Base64.getDecoder().decode(base64Data);
            }

            if (updateBanner && companyBanner != null && !companyBanner.isEmpty()) {
                String base64Data = companyBanner;
                if (base64Data.contains(",")) {
                    base64Data = base64Data.split(",")[1];
                }
                bannerBytes = Base64.getDecoder().decode(base64Data);
            }

            companyUserMapper.updateCompanyInfo(
                companyId,
                companyName,
                companyPhone,
                updateImage ? imageBytes : null,
                updateBanner ? bannerBytes : null,
                updateImage,
                updateBanner
            );

            return ResponseEntity.ok("정보가 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("정보 수정 실패: " + e.getMessage());
        }
    }

    // 기업 회원 비밀번호 변경
    @PutMapping("/{companyId}/password")
    public ResponseEntity<?> updateCompanyPassword(
            @PathVariable String companyId,
            @RequestBody Map<String, String> passwords) {
        try {
            String currentPassword = passwords.get("currentPassword");
            String newPassword = passwords.get("newPassword");

            CompanyUserBean company = companyUserMapper.getCompanyUserInfo(companyId);
            if (company == null) {
                return ResponseEntity.badRequest().body("기업 정보를 찾을 수 없습니다.");
            }

            // 현재 비밀번호 확인
            if (!company.getCompanyPassword().equals(currentPassword)) {
                return ResponseEntity.badRequest().body("현재 비밀번호가 일치하지 않습니다.");
            }

            // 비밀번호 업데이트
            companyUserMapper.updateCompanyPassword(companyId, newPassword);

            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
