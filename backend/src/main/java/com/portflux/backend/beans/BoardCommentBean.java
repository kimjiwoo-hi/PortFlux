package com.portflux.backend.beans;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class BoardCommentBean {
    private int commentId;
    private Integer userNum;    // Integer로 변경 (null 허용)
    private Integer companyNum; // [추가] 기업 번호
    private int postId;
    private String content;
    private Timestamp createdAt;
    private Timestamp modifyAt;
    private Integer parentId; 
    private String userNickname; // 조인해서 가져올 닉네임/기업명
    private String role;         // [추가] 작성자 권한 (USER/COMPANY)
}