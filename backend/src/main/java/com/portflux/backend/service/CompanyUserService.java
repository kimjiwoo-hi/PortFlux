package com.portflux.backend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portflux.backend.api.BusinessNumApi; // (외부 API 사용 시)
import com.portflux.backend.beans.CompanyRegisterBean;
import com.portflux.backend.beans.CompanyUserBean;
import com.portflux.backend.beans.UserLoginBean;
import com.portflux.backend.mapper.CompanyUserMapper;
import com.portflux.backend.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyUserService {

    private final CompanyUserMapper companyUserMapper;
    private final UserMapper userMapper; // 일반 유저 테이블 조회를 위해 추가
    private final BusinessNumApi businessNumApi;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public boolean registerCompany(CompanyRegisterBean registerBean) {

        // 0. 아이디/이메일 중복 확인 (일반 + 기업 테이블 모두)
        if (companyUserMapper.checkCompanyIdDuplicate(registerBean.getUserId()) > 0 || userMapper.checkIdDuplicate(registerBean.getUserId()) > 0) {
            throw new RuntimeException("이미 사용 중인 아이디입니다.");
        }
        if (companyUserMapper.checkCompanyEmailDuplicate(registerBean.getEmail()) > 0 || userMapper.checkEmailDuplicate(registerBean.getEmail()) > 0) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }
        
        // 1. 사업자번호 유효성 검사 (외부 API)
        if (!businessNumApi.checkBusinessNumber(registerBean.getBusinessNumber())) {
            throw new RuntimeException("유효하지 않은 사업자번호입니다.");
        }

        // 2. 비밀번호 일치 확인
        if (!registerBean.getPassword().equals(registerBean.getPasswordCheck())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(registerBean.getPassword());
        registerBean.setPassword(encodedPassword);
        
        // 4. 아이디가 비어있으면 이메일로 설정 (선택사항)
        if (registerBean.getUserId() == null || registerBean.getUserId().isEmpty()) {
            registerBean.setUserId(registerBean.getEmail());
        }

        // 5. DB 저장
        companyUserMapper.insertCompanyUser(registerBean);
        
        return true;
    }
    
    // 사업자번호 검증 메서드
    public boolean isBusinessNumberValid(String bNo) {
        return businessNumApi.checkBusinessNumber(bNo);
    }

    // 사업자번호 검증 및 기업 정보 조회
    public Map<String, Object> getBusinessNumberInfo(String bNo) {
        return businessNumApi.checkBusinessNumberWithInfo(bNo);
    }

    /**
     * 2. 기업 로그인 로직
     */
    public Map<String, Object> loginCompany(UserLoginBean loginBean) {
        Map<String, Object> response = new HashMap<>();
        System.out.println("### [Company Login Attempt] ID: " + loginBean.getUserId());

        CompanyUserBean companyUser = companyUserMapper.getCompanyUserInfo(loginBean.getUserId());

        if (companyUser != null && passwordEncoder.matches(loginBean.getPassword(), companyUser.getCompanyPassword())) {
            response.put("num", companyUser.getCompanyNum());
            response.put("id", companyUser.getCompanyId());
            response.put("name", companyUser.getCompanyName());
            response.put("role", "COMPANY");
            response.put("memberType", "company");
            System.out.println("=> 기업 로그인 성공: " + companyUser.getCompanyName());
            return response;
        }

        throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
}