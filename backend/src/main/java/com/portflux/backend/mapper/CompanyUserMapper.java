package com.portflux.backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.portflux.backend.beans.CompanyUserBean;

@Mapper
public interface CompanyUserMapper {
    void insertCompanyUser(CompanyUserBean companyUserBean);
    CompanyUserBean findCompanyByEmail(String email);
}