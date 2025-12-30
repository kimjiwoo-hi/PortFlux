package com.portflux.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class CommentDto {
    private int commentId;
    private int postId;
    private Integer userNum;  // ✅ Integer로 변경
    private String userNickname;
    private byte[] userImage;
    private String userImageBase64;  // ✅ 추가: Base64 인코딩된 이미지
    private String commentContent;
    private Date commentCreatedAt;
    private String postTitle;
    private String boardType;
}