package com.portflux.backend.beans;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor // [필수] JSON 파싱 에러 방지
@AllArgsConstructor
public class UserRegisterBean {
    // 프론트엔드 JSON 키값과 100% 일치해야 함
    private String userId;
    private String email;
    private String password;
    private String passwordCheck;
    private String name;
    private String nickname;
    private String phoneNumber;
    private String authCode; // 인증코드
}