
package com.portflux.backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.beans.CompanyUserBean;

@Mapper
public interface CompanyUserMapper {
    
    void insertCompanyUser(CompanyRegisterBean companyRegisterBean);
    
    int checkBusinessNumber(String businessNumber);
    CompanyUserBean findCompanyByEmail(String email);

    int existsByCompanyName(@Param("name") String name);
}
