package com.portflux.backend.beans;

import java.sql.Date;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserBean {
    private Long userNum;       // PK
    private String userId;
    private String userPassword;
    private String userName;
    private String userPhone;
    private String userEmail;
    private String userNickname;
    private String drawnUser;   // Y/N
    private Date userCreateAt;
    private Integer userLevel;
    private byte[] userImage;   // BLOB
    private byte[] userBanner;  // BLOB
}