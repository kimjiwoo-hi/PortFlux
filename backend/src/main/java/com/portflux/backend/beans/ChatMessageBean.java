package com.portflux.backend.beans;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageBean {
    
    private Long messageId;
    private Long roomId;
    private Long userNum;
    private Long senderNum;
    private String content;
    private boolean hasFile;
    private Date sentAt;
    private boolean readYn;
    private boolean deleteYn;
}