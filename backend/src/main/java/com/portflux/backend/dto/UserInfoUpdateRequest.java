package com.portflux.backend.dto;

import lombok.Data;

@Data
public class UserInfoUpdateRequest {
    private String userName;
    private String userNickname;
    private String userEmail;
    private String userPhone;
    private String userImage;  // Base64 문자열 (프론트엔드에서 전송)
    private String userBanner; // Base64 문자열 (프론트엔드에서 전송)
}
