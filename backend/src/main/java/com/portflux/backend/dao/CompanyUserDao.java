package com.portflux.backend.dao;

import org.springframework.stereotype.Repository;
import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.beans.CompanyUserBean;
import com.portflux.backend.mapper.CompanyUserMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CompanyUserDao {

    private final CompanyUserMapper companyUserMapper;

    // 파라미터를 RegisterBean으로 받아서 Mapper로 전달
    public void insertCompanyUser(CompanyRegisterBean companyRegisterBean) {
        companyUserMapper.insertCompanyUser(companyRegisterBean);
    }
    
    public CompanyUserBean findCompanyByEmail(String email) {
        return companyUserMapper.findCompanyByEmail(email);
    }
}