package com.portflux.backend.beans;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class BoardFreeBean {
    private Integer postId;      // 게시글 번호
    private String boardType;    // 게시판 타입 (free, notice 등)
    private String title;        // 제목
    private String content;      // 내용
    private Timestamp createdAt; // 생성일
    private Timestamp updatedAt; // 수정일
    private Integer viewCnt;     // 조회수
    private Integer likeCnt;     // 좋아요 수
    private String postFile;     // 첨부파일 경로
    private String image;        // 이미지 경로
    
    // 작성자 정보
    private Integer userNum;     // 유저 고유 번호
    private String userNickname; // 유저 닉네임
    private Integer adminNum;    // 관리자 번호 (필요 시 사용)
    
    private Integer commentCnt;  // 댓글 개수
}