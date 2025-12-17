package com.portflux.backend.beans;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatBean {

    private Long roomId;          // room_id (PK)
    private Long user1Num;        // user1_num (항상 작은 번호로 저장 권장)
    private Long user2Num;        // user2_num (항상 큰 번호로 저장 권장)
    private Date createdAt;       // created_at
    private Date lastMessageAt;   // last_message_at
    private String status;        // status (ACTIVE 등)
}