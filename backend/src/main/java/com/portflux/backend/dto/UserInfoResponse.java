package com.portflux.backend.dto;

import com.portflux.backend.beans.UserBean;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserInfoResponse {
    private String userId;
    private String userName;
    private String userNickname;
    private String userEmail;
    private String userPhone;
    private LocalDateTime userCreateAt;
    private Integer userLevel;
    private String userImage;  // Base64 문자열
    private String userBanner; // Base64 문자열

    // UserBean으로부터 DTO 생성
    public static UserInfoResponse fromEntity(UserBean user) {
        UserInfoResponse response = new UserInfoResponse();
        response.setUserId(user.getUserId());
        response.setUserName(user.getUserName());
        response.setUserNickname(user.getUserNickname());
        response.setUserEmail(user.getUserEmail());
        response.setUserPhone(user.getUserPhone());
        
        // [수정 포인트] java.sql.Date를 LocalDateTime으로 변환
        if (user.getUserCreateAt() != null) {
            // Date -> LocalDate -> LocalDateTime(시간은 00:00:00으로 설정)
            response.setUserCreateAt(user.getUserCreateAt().toLocalDate().atStartOfDay());
        }

        response.setUserLevel(user.getUserLevel());

        // byte[]를 Base64 문자열로 변환하여 설정 (UserBean의 getter 활용)
        if (user.getUserImage() != null && user.getUserImage().length > 0) {
            response.setUserImage("data:image/jpeg;base64," + user.getUserImageBase64());
        }
        if (user.getUserBanner() != null && user.getUserBanner().length > 0) {
            response.setUserBanner("data:image/jpeg;base64," + user.getUserBannerBase64());
        }

        return response;
    }
}