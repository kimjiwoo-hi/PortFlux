package com.portflux.backend.beans;

import lombok.Data;
import java.sql.Timestamp; // [수정] 정밀한 시간 보관을 위해 변경

@Data
public class BoardCommentBean {
    private int commentId;        // comment_id
    private int userNum;          // user_num
    private int postId;           // post_id
    private String content;       // comment_content
    private Timestamp createdAt;  // [수정] Timestamp로 변경
    private Timestamp modifyAt;   // [수정] Timestamp로 변경

    private Integer parentId; 
    private String userNickname;  // 조인해서 가져올 작성자 닉네임
}