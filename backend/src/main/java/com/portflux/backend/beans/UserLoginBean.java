package com.portflux.backend.beans;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginBean {
    private String email;
    private String password;
    private boolean autoLogin;
}