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
    private final BusinessNumApi businessNumApi; // 아까 만든 API
    private final PasswordEncoder passwordEncoder; // Config에 등록한 암호화 기계

    @Transactional
    public boolean registerCompany(CompanyRegisterBean registerBean) {
        
        // 1. 사업자 등록번호 진위 확인 (API 호출)
        boolean isValid = businessNumApi.checkBusinessNumber(registerBean.getBusinessNumber());
        if (!isValid) {
            return false; // 가짜 사업자번호면 가입 거절
        }

        // 2. 비밀번호 일치 확인
        if (!registerBean.getPassword().equals(registerBean.getPasswordCheck())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(registerBean.getPassword());

        // 4. DB 저장용 Bean으로 변환
        CompanyUserBean companyUser = new CompanyUserBean();
        companyUser.setBusinessNumber(registerBean.getBusinessNumber());
        companyUser.setCompanyEmail(registerBean.getEmail());
        companyUser.setCompanyPassword(encodedPassword); // 암호화된 비번 저장
        companyUser.setCompanyName(registerBean.getNickname()); // 닉네임을 기업명으로 사용 (기획에 따라 조정)
        companyUser.setCompanyPhone(registerBean.getPhoneNumber());
        // 아이디는 이메일과 동일하게 설정
        companyUser.setCompanyId(registerBean.getEmail());

        // 5. DB 저장 (DAO 호출)
        companyUserDao.insertCompanyUser(companyUser);
        
        return true;
    }
}