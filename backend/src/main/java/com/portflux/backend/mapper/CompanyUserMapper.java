package com.portflux.backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.beans.CompanyUserBean;

@Mapper
public interface CompanyUserMapper {
    
    // 기업 회원가입
    void insertCompanyUser(CompanyRegisterBean companyRegisterBean);
    
    // 사업자번호 중복 확인
    int checkBusinessNumber(String businessNumber);
    
    // 이메일로 기업 찾기
    CompanyUserBean findCompanyByEmail(String email);
    
    // 기업명(닉네임) 중복 확인 (일반 유저와 닉네임 공유 시 사용)
    int existsByCompanyName(@Param("name") String name);
}