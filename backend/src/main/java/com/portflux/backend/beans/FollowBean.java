package com.portflux.backend.beans;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FollowBean {
    
    private Long followId;
    private Long followerId;
    private Long followingId;
    private Date createdAt;
}
