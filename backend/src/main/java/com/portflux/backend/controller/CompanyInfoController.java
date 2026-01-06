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

            // BLOB 데이터를 Base64로 변환
            if (company.getCompanyImage() != null && company.getCompanyImage().length > 0) {
                String base64Image = Base64.getEncoder().encodeToString(company.getCompanyImage());
                response.put("companyImage", "data:image/jpeg;base64," + base64Image);
            } else {
                response.put("companyImage", null);
            }

            if (company.getCompanyBanner() != null && company.getCompanyBanner().length > 0) {
                String base64Banner = Base64.getEncoder().encodeToString(company.getCompanyBanner());
                response.put("companyBanner", "data:image/jpeg;base64," + base64Banner);
            } else {
                response.put("companyBanner", null);
            }

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

    // 기업명 중복 확인
    @PostMapping("/check-company-name")
    public ResponseEntity<Boolean> checkCompanyName(@RequestBody Map<String, String> request) {
        try {
            String companyName = request.get("companyName");
            String currentCompanyId = request.get("companyId"); // 현재 기업 ID (선택사항)

            // 현재 기업 ID가 있으면 자신을 제외하고 중복 체크
            int count;
            if (currentCompanyId != null && !currentCompanyId.isEmpty()) {
                count = companyUserMapper.existsByCompanyNameExcludingCurrent(companyName, currentCompanyId);
            } else {
                count = companyUserMapper.existsByCompanyName(companyName);
            }

            return ResponseEntity.ok(count == 0); // 중복이 아니어야 true(사용가능)
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(false);
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
