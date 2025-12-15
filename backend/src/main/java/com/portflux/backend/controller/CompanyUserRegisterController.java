package com.portflux.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.service.CompanyUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/company/register")
@RequiredArgsConstructor
public class CompanyUserRegisterController {

    private final CompanyUserService companyUserService;

    // 1. 회원가입
    @PostMapping("/proc")
    public ResponseEntity<String> registerCompany(@RequestBody CompanyRegisterBean registerBean) {
        try {
            boolean isSuccess = companyUserService.registerCompany(registerBean);
            if (isSuccess) {
                return ResponseEntity.ok("기업 회원가입 성공");
            } else {
                return ResponseEntity.badRequest().body("가입 실패: 유효하지 않은 사업자번호입니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. 사업자번호 조회 전용 API
    @PostMapping("/check-business")
    public ResponseEntity<?> checkBusinessNumberOnly(@RequestBody Map<String, String> request) {
        String businessNumber = request.get("businessNumber");
        
        // [디버깅] 요청 도착 확인 로그
        System.out.println("================");
        System.out.println("🚀 [Controller] 사업자번호 조회 요청 도착: " + businessNumber);
        System.out.println("================");

        try {
            boolean isValid = companyUserService.isBusinessNumberValid(businessNumber);
            System.out.println("🚀 [Controller] 검증 결과: " + isValid);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            System.out.println("🔥 [Controller] 에러 발생: " + e.getMessage());
            e.printStackTrace(); // 터미널에 에러 내용 강제 출력
            return ResponseEntity.internalServerError().body("서버 에러: " + e.getMessage());
        }
    }
}

    private final CompanyUserService companyUserService;

    // 1. 회원가입
    @PostMapping("/proc")
    public ResponseEntity<String> registerCompany(@RequestBody CompanyRegisterBean registerBean) {
        try {
            boolean isSuccess = companyUserService.registerCompany(registerBean);
            if (isSuccess) {
                return ResponseEntity.ok("기업 회원가입 성공");
            } else {
                return ResponseEntity.badRequest().body("가입 실패: 유효하지 않은 사업자번호입니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. 사업자번호 조회 전용 API
    @PostMapping("/check-business")
    public ResponseEntity<?> checkBusinessNumberOnly(@RequestBody Map<String, String> request) {
        String businessNumber = request.get("businessNumber");
        
        // [디버깅] 요청 도착 확인 로그
        System.out.println("================");
        System.out.println("🚀 [Controller] 사업자번호 조회 요청 도착: " + businessNumber);
        System.out.println("================");

        try {
            boolean isValid = companyUserService.isBusinessNumberValid(businessNumber);
            System.out.println("🚀 [Controller] 검증 결과: " + isValid);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            System.out.println("🔥 [Controller] 에러 발생: " + e.getMessage());
            e.printStackTrace(); // 터미널에 에러 내용 강제 출력
            return ResponseEntity.internalServerError().body("서버 에러: " + e.getMessage());
        }
    }
}