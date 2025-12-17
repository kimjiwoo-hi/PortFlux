package com.portflux.backend.beans;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyRegisterBean {
    private String businessNumber; // 사업자번호
    private String email;
    private String authCode;
    private String password;
    private String passwordCheck;
    private String name;
    private String nickname;
    private String phoneNumber;
}