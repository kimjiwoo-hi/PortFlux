package com.portflux.backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.beans.CompanyUserBean;

@Mapper
public interface CompanyUserMapper {
    
    void insertCompanyUser(CompanyRegisterBean companyRegisterBean);
    
    int checkBusinessNumber(String businessNumber);
    CompanyUserBean findCompanyByEmail(String email);
}