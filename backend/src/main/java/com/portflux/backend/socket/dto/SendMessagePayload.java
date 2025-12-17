package com.portflux.backend.socket.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SendMessagePayload {
    private Long roomId;
    private String content;
    private String hasFile; // 'Y'/'N'
}
