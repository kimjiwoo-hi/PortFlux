package com.portflux.backend.dto;

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
    private Integer userNum;      // 일반회원
    private Integer companyNum;   // 기업회원
    private String memberType;    // "user" 또는 "company"
    private String userNickname;
    private byte[] userImage;
    private String userImageBase64;  // ✅ Base64 인코딩된 이미지
    private String userBannerBase64; // ✅ Base64 인코딩된 배너
    private String tags;
    private int viewCnt;
    private Date createdAt;
    private Date updatedAt;
    private int downloadCnt;
    private List<String> pdfImages;
    private String aiSummary;
    private String boardType;
    private int likeCnt; 
}