package com.portflux.backend.beans;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatBean {

    private Long messageId;
    private Long roomId;
    private Long user1Num;   //수신자
    private Long user2Num; //송신자
    private String content;
    private String hasFile;
    private Date sentAt;
    private String readYn;
    private String deletedYn;
}
