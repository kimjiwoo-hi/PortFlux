package com.portflux.backend.beans;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatBean {

    private int room_id;
    private int user1_num;
    private int user2_num;
    private Date createdAt;
    private Date last_message_at;
    private String status;
}
