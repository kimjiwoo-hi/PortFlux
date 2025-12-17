package com.portflux.backend.beans;

import lombok.Data;
import java.util.Date;

@Data
public class BoardFreeBean {
    private int post_id;      // DB PK
    private int postId;       // Frontend용 (카멜케이스)
    
    private String board_type;
    private String boardType; // Frontend용
    
    private String title;
    private String content;
    
    private String userId;    // DB Insert용 (user_id)
    private String user_nickname; 
    private String userNickname;  

    private int view_cnt;
    private int like_cnt;
    private int comment_cnt;
    
    private Date created_at;
    private Date updated_at;
    
    // Lombok(@Data) 미작동 시 대비용 수동 Getter/Setter
    public int getPost_id() { return post_id; }
    public void setPost_id(int post_id) { this.post_id = post_id; this.postId = post_id; }
    
    public String getBoardType() { return boardType != null ? boardType : board_type; }
    public void setBoardType(String boardType) { this.boardType = boardType; this.board_type = boardType; }
    
    public String getUserNickname() { return userNickname != null ? userNickname : user_nickname; }
}