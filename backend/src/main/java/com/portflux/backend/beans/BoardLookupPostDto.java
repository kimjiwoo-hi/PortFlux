package com.portflux.backend.beans;

import lombok.Getter;
import lombok.Setter;
import java.util.Date;
import java.util.List;

@Getter
@Setter
public class BoardLookupPostDto {
    private int postId;
    private String title;
    private String content;
    private int price;
    private String postFile;
    private int userNum;
    private String userNickname;
    private byte[] userImage; // BLOB은 byte[]로 매핑
    private String tags; // JSON 문자열 형태의 태그
    private int viewCnt;
    private Date createdAt;
    private String aiSummary;
    private int downloadCnt;
}