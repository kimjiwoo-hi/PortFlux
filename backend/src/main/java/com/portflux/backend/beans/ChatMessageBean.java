package com.portflux.backend.beans;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageBean {
    
    private int message_id;
    private int room_id;
    private int sender_num;
    private int user_num;
    private String content;
    private boolean has_file;
    private Date sent_at;
    private boolean read_yn;
    private boolean delete_yn;
}
