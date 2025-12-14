package com.portflux.backend.beans;

import java.time.LocalDateTime; // Date 대신 LocalDateTime 권장
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
}