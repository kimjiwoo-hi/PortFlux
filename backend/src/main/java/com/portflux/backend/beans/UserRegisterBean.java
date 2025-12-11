package com.portflux.backend.beans;

import lombok.Data;

@Data
public class UserRegisterBean {
    private String userId;     
    private String email;        
    private String password;
    private String passwordCheck;
    private String name;
    private String nickname;
    private String phoneNumber;
    private String authCode;     // 인증코드 (DB 저장 X)
    
    
}