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

    public void insertCompanyUser(CompanyRegisterBean companyRegisterBean) {
        companyUserMapper.insertCompanyUser(companyRegisterBean);
    }
    
    public CompanyUserBean findCompanyByEmail(String email) {
        return companyUserMapper.findCompanyByEmail(email);
    }
}