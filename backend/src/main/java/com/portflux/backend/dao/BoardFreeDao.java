package com.portflux.backend.dao;

import com.portflux.backend.beans.BoardFreeBean;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface BoardFreeDao {

    // 게시글 목록 조회
    List<BoardFreeBean> getBoardList();

    // 게시글 작성
    void insertBoard(BoardFreeBean boardFreeBean);

    // 상세 조회
    BoardFreeBean getBoardDetail(int postId);

    // 조회수 증가
    void increaseViewCount(int postId);
    
    // 수정
    void updateBoard(BoardFreeBean boardFreeBean);
    
    // 삭제
    void deleteBoard(int postId);
}