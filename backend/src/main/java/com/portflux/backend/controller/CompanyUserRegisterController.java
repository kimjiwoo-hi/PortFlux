package com.portflux.backend.controller;

import org.springframework.http.ResponseEntity;
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
}