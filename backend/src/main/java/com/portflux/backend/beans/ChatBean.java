package com.portflux.backend.beans;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatBean {

    private Long messageId;
    private Long roomId;
    private Long userNum;   //수신자
    private Long senderNum; //송신자
    private String content;
    private String hasFile;
    private Date sentAt;
    private String readYn;
    private String deletedYn;
}
