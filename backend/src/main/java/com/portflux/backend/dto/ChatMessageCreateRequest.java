package com.portflux.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChatMessageCreateRequest {
    private String content;
    private String hasFile; // 기본 'N' 처리
}
