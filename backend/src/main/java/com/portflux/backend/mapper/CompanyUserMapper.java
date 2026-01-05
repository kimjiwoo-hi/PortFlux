
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
    
    // [확인] 이메일로 기업 찾기 (구글 로그인 시 필수 사용)
    CompanyUserBean findCompanyByEmail(@Param("email") String email);
    
    // 기업명(닉네임) 중복 확인
    int existsByCompanyName(@Param("name") String name);

    // 아이디 중복 확인
    int checkCompanyIdDuplicate(String companyId);

    // 이메일 중복 확인
    int checkCompanyEmailDuplicate(String email);

    // 기업 정보 가져오기 (로그인 및 프로필 조회용)
    CompanyUserBean getCompanyUserInfo(String companyId);

    // 기업명과 이메일로 기업 찾기 (아이디 찾기용)
    CompanyUserBean findByCompanyNameAndEmail(@Param("companyName") String companyName, @Param("email") String email);

    // 기업 비밀번호 변경
    void updateCompanyPassword(@Param("companyId") String companyId, @Param("newPassword") String newPassword);

    // 기업 번호로 기업 정보 가져오기
    CompanyUserBean getCompanyUserByNum(@Param("companyNum") int companyNum);

    // 기업 정보 수정
    void updateCompanyInfo(
        @Param("companyId") String companyId,
        @Param("companyName") String companyName,
        @Param("companyPhone") String companyPhone,
        @Param("companyImage") byte[] companyImage,
        @Param("companyBanner") byte[] companyBanner,
        @Param("updateImage") boolean updateImage,
        @Param("updateBanner") boolean updateBanner
    );
}
