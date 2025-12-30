package com.portflux.backend.beans;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRegisterBean {
    // 프론트엔드 JSON 키값과 일치해야 함
    private String userId;          // 기업 아이디 (email과 동일하게 사용하거나 별도 지정)
    private String email;           // 이메일
    private String password;        // 비밀번호
    private String passwordCheck;   // 비밀번호 확인
    private String name;            // 담당자 이름 (또는 대표자명)
    private String nickname;        // 닉네임 (기업명으로 대체 가능)
    private String phoneNumber;     // 전화번호
    private String authCode;        // 인증코드
    private String businessNumber;  // 사업자번호 (기업 필수)
}