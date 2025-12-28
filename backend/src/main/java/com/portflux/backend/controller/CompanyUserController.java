package com.portflux.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.service.CompanyUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class CompanyUserController {

    private final CompanyUserService companyUserService;

    // 1. 기업 회원가입 처리
    @PostMapping("/register/proc")
    public ResponseEntity<String> registerCompany(@RequestBody CompanyRegisterBean registerBean) {
        // [디버깅] 요청 데이터 확인
        System.out.println(">>> 기업 회원가입 요청: " + registerBean);

        try {
            boolean isSuccess = companyUserService.registerCompany(registerBean);
            if (isSuccess) {
                return ResponseEntity.ok("기업 회원가입 성공");
            } else {
                // 이 부분은 서비스에서 throw된 예외로 처리되므로 사실상 도달하기 어려움
                return ResponseEntity.badRequest().body("가입 실패: 원인 불명");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("가입 오류: " + e.getMessage());
        }
    }

    // 2. 사업자번호 조회 API
    @PostMapping("/register/check-business")
    public ResponseEntity<?> checkBusinessNumberOnly(@RequestBody Map<String, String> request) {
        String businessNumber = request.get("businessNumber");
        System.out.println(">>> 사업자번호 조회 요청: " + businessNumber);

        try {
            boolean isValid = companyUserService.isBusinessNumberValid(businessNumber);
            System.out.println(">>> 검증 결과: " + isValid);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("서버 에러: " + e.getMessage());
        }
    }

    // 3. 기업 로그인 처리
    @PostMapping("/login/proc")
    public ResponseEntity<?> login(@RequestBody UserLoginBean loginBean) {
        try {
            Map<String, Object> loginResult = companyUserService.loginCompany(loginBean);
            return ResponseEntity.ok(loginResult);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}