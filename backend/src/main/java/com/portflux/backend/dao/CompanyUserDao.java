package com.portflux.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.portflux.backend.beans.CompanyUserBean;
import com.portflux.backend.mapper.CompanyUserMapper;

@Repository
public class CompanyUserDao {

    @Autowired
    private CompanyUserMapper companyUserMapper;

    // 기업 회원가입
    public void insertCompanyUser(CompanyUserBean companyUserBean) {
        companyUserMapper.insertCompanyUser(companyUserBean);
    }

    // 이메일로 기업 정보 가져오기
    public CompanyUserBean getCompanyInfo(String email) {
        return companyUserMapper.findCompanyByEmail(email);
    }
}