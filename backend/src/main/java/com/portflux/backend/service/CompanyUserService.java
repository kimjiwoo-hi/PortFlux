package com.portflux.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portflux.backend.api.BusinessNumApi;
import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.beans.CompanyUserBean;
import com.portflux.backend.dao.CompanyUserDao;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyUserService {

    private final CompanyUserDao companyUserDao;
    private final BusinessNumApi businessNumApi;
    private final PasswordEncoder passwordEncoder;

    // 1. 기업 회원가입 처리
    @Transactional
    public boolean registerCompany(CompanyRegisterBean registerBean) {
        
        // 1) 사업자 등록번호 유효성 재확인
        boolean isValid = businessNumApi.checkBusinessNumber(registerBean.getBusinessNumber());
        if (!isValid) {
            return false;
        }

        // 2) 비밀번호 일치 확인
        if (!registerBean.getPassword().equals(registerBean.getPasswordCheck())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 3) 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(registerBean.getPassword());

        // 4) DB 저장용 Bean 생성 및 설정
        CompanyUserBean companyUser = new CompanyUserBean();
        companyUser.setBusinessNumber(registerBean.getBusinessNumber());
        companyUser.setCompanyEmail(registerBean.getEmail());
        companyUser.setCompanyPassword(encodedPassword);
        companyUser.setCompanyName(registerBean.getNickname());
        companyUser.setCompanyPhone(registerBean.getPhoneNumber());
        companyUser.setCompanyId(registerBean.getEmail());

        // 5) DB 저장
        companyUserDao.insertCompanyUser(companyUser);
        
        return true;
    }

    // 2. 사업자번호 유효성 검증 (API 호출)
    public boolean isBusinessNumberValid(String businessNumber) {
        return businessNumApi.checkBusinessNumber(businessNumber);
    }
}