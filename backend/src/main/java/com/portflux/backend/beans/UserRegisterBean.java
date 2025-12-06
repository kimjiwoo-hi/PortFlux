package com.portflux.backend.beans;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterBean {
    private String email;
    private String authCode;
    private String password;
    private String passwordCheck;
    private String nickname;
    private String phoneNumber;
}