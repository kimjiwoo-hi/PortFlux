package com.portflux.backend.beans;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class CommentDto {
    private int commentId;
    private int userNum;
    private String userNickname;
    private byte[] userImage;
    private String commentContent;
    private Date commentCreatedAt;
}