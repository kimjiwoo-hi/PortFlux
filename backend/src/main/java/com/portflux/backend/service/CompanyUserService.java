package com.portflux.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portflux.backend.api.BusinessNumApi; // (외부 API 사용 시)
import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.mapper.CompanyUserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyUserService {

    private final CompanyUserMapper companyUserMapper; // Mapper 직접 사용 (DAO 생략 가능)
    private final BusinessNumApi businessNumApi;       // 사업자 인증 API
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public boolean registerCompany(CompanyRegisterBean registerBean) {
        
        // 1. 사업자번호 유효성 검사 (외부 API)
        if (!businessNumApi.checkBusinessNumber(registerBean.getBusinessNumber())) {
            throw new RuntimeException("유효하지 않은 사업자번호입니다.");
        }

        // 2. 비밀번호 일치 확인
        if (!registerBean.getPassword().equals(registerBean.getPasswordCheck())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(registerBean.getPassword());
        registerBean.setPassword(encodedPassword);
        
        // 4. 아이디가 비어있으면 이메일로 설정 (선택사항)
        if (registerBean.getUserId() == null || registerBean.getUserId().isEmpty()) {
            registerBean.setUserId(registerBean.getEmail());
        }

        // 5. DB 저장
        companyUserMapper.insertCompanyUser(registerBean);
        
        return true;
    }
    
    // 사업자번호 검증 메서드
    public boolean isBusinessNumberValid(String bNo) {
        return businessNumApi.checkBusinessNumber(bNo);
    }
}