package com.portflux.backend.beans;

import java.util.Base64;
import jakarta.persistence.*;
import lombok.Data;
import java.sql.Date;

@Data
@Entity
@Table(name = "USERS")
public class UserBean {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_num")
    private int userNum;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    @Column(name = "user_password", nullable = false)
    private String userPw;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_phone")
    private String userPhone;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "user_nickname", nullable = false)
    private String userNickname;

    @Column(name = "drawn_user")
    private String drawnUser;

    @Column(name = "user_create_at", insertable = false, updatable = false)
    private Date userCreateAt;

    @Column(name = "user_level")
    private int userLevel;

    // 실제 DB의 BLOB 컬럼과 매핑 (byte 배열)
    @Lob
    @Column(name = "user_image")
    private byte[] userImage; 

    @Lob
    @Column(name = "user_banner")
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
            String base64Data = base64String;
            if (base64String.contains(",")) {
                base64Data = base64String.split(",")[1];
            }
            this.userBanner = Base64.getDecoder().decode(base64Data);
        }
        this.userBannerBase64 = base64String;
    }
}