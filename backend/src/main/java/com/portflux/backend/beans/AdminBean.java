package com.portflux.backend.beans;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "ADMIN_ACCOUNT")
public class AdminBean {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_num")
    private int adminNum;

    @Column(name = "user_num") // 추가
    private int userNum;

    @Column(name = "admin_id", unique = true, nullable = false)
    private String adminId;

    @Column(name = "admin_name")
    private String adminName;

    @Column(name = "assigned_at", insertable = false, updatable = false)
    private Timestamp assignedAt;
}