package com.portflux.backend.beans;

import lombok.Data;

@Data
public class UserLoginBean {
    private String userId;  
    private String password;
    private boolean autoLogin;
}