package com.portflux.backend.beans;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatBean {


    private Long roomId;
    private Long user1Num;
    private Long user2Num;
    private Date createdAt;
    private Date lastMessageAt;
    private String status;
}
