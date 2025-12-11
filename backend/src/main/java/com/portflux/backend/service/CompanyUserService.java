package com.portflux.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portflux.backend.api.BusinessNumApi;
import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.dao.CompanyUserDao; // ★ DAO 사용

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyUserService {

    private final CompanyUserDao companyUserDao; // ★ DAO 주입
    private final BusinessNumApi businessNumApi;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public boolean registerCompany(CompanyRegisterBean registerBean) {
        
        if (!businessNumApi.checkBusinessNumber(registerBean.getBusinessNumber())) {
            return false;
        }

        if (!registerBean.getPassword().equals(registerBean.getPasswordCheck())) {
            throw new RuntimeException("비밀번호 불일치");
        }

        String encodedPassword = passwordEncoder.encode(registerBean.getPassword());
        registerBean.setPassword(encodedPassword);

        // ★ DAO 호출
        companyUserDao.insertCompanyUser(registerBean);
        
        return true;
    }
    
    public boolean isBusinessNumberValid(String bNo) {
        return businessNumApi.checkBusinessNumber(bNo);
    }
}