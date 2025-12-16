package com.portflux.backend.beans;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
    name = "FOLLOWS",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_follows",
        columnNames = {"FOLLOWER_ID", "FOLLOWING_ID"}
    )
)
@Data
public class FollowBean {

    //팔로우 고유 번호 (PK) 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FOLLOW_ID")
    private Long followId;

    // 팔로우를 건 유저 (user_num)
    @Column(name = "FOLLOWER_ID", nullable = false)
    private Long followerId;

    // 팔로우 당한 유저 (user_num)
    @Column(name = "FOLLOWING_ID", nullable = false)
    private Long followingId;

    // 팔로우 생성 시각
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
