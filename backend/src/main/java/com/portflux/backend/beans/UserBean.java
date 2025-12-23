package com.portflux.backend.beans;

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

    // [핵심 수정] BLOB 컬럼은 String이 아니라 byte[]로 받아야 함
    @Lob
    @Column(name = "user_image")
    private byte[] userImage; 

    @Lob
    @Column(name = "user_banner")
    private byte[] userBanner; 
}