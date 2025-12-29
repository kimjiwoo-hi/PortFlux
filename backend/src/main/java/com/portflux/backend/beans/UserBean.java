package com.portflux.backend.beans;

import java.time.LocalDateTime; // Date 대신 LocalDateTime 권장
import java.util.Base64;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

@Entity
@Table(name = "USERS")
@Data
public class UserBean {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_NUM")
    private Long userNum;

    @Column(name = "USER_ID", nullable = false, length = 50)
    private String userId;

    @Column(name = "USER_PASSWORD", nullable = false, length = 100)
    private String userPassword;

    @Column(name = "USER_NAME", nullable = false, length = 100)
    private String userName;

    @Column(name = "USER_PHONE", length = 20)
    private String userPhone;

    @Column(name = "USER_EMAIL", nullable = false, length = 255)
    private String userEmail;

    @Column(name = "USER_NICKNAME", nullable = false, length = 100)
    private String userNickname;

    @Column(name = "DRAWN_USER", length = 1)
    private String drawnUser;

    @Column(name = "USER_CREATE_AT", nullable = false)
    private LocalDateTime userCreateAt = LocalDateTime.now();

    @Column(name = "USER_LEVEL")
    private Integer userLevel;

    @Column(name = "USER_IMAGE")
    private byte[] userImage;

    @Column(name = "USER_BANNER")
    private byte[] userBanner;

    // 프론트엔드와 통신용 Base64 문자열 필드 (DB에 저장되지 않음)
    @Transient
    private String userImageBase64;

    @Transient
    private String userBannerBase64;

    // userImage를 Base64 문자열로 변환하여 반환
    public String getUserImageBase64() {
        if (userImage != null && userImage.length > 0) {
            return Base64.getEncoder().encodeToString(userImage);
        }
        return null;
    }

    // Base64 문자열을 받아서 userImage(byte[])로 변환
    public void setUserImageBase64(String base64String) {
        if (base64String != null && !base64String.isEmpty()) {
            // "data:image/...;base64," 접두사 제거
            String base64Data = base64String;
            if (base64String.contains(",")) {
                base64Data = base64String.split(",")[1];
            }
            this.userImage = Base64.getDecoder().decode(base64Data);
        }
        this.userImageBase64 = base64String;
    }

    // userBanner를 Base64 문자열로 변환하여 반환
    public String getUserBannerBase64() {
        if (userBanner != null && userBanner.length > 0) {
            return Base64.getEncoder().encodeToString(userBanner);
        }
        return null;
    }

    // Base64 문자열을 받아서 userBanner(byte[])로 변환
    public void setUserBannerBase64(String base64String) {
        if (base64String != null && !base64String.isEmpty()) {
            // "data:image/...;base64," 접두사 제거
            String base64Data = base64String;
            if (base64String.contains(",")) {
                base64Data = base64String.split(",")[1];
            }
            this.userBanner = Base64.getDecoder().decode(base64Data);
        }
        this.userBannerBase64 = base64String;
    }
}