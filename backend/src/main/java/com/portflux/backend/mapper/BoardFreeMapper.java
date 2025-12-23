package com.portflux.backend.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.portflux.backend.beans.BoardFreeBean;
import com.portflux.backend.beans.BoardCommentBean;

@Mapper
public interface BoardFreeMapper {
    
    // 좋아요 관련
    int checkLike(@Param("postId") int postId, @Param("userNum") int userNum);
    void insertLike(@Param("postId") int postId, @Param("userNum") int userNum);
    void deleteLike(@Param("postId") int postId, @Param("userNum") int userNum);
    void increaseLikeCount(int postId);
    void decreaseLikeCount(int postId);

    // 게시판 CRUD 관련
    List<BoardFreeBean> getBoardList(@Param("keyword") String keyword);
    void insertBoard(BoardFreeBean bean);
    BoardFreeBean getBoardDetail(int postId);
    void increaseViewCount(int postId);
    void updateBoard(BoardFreeBean bean);
    void deleteBoard(int postId);

    // [추가] 댓글 관련 메서드
    List<BoardCommentBean> getCommentList(int postId);
    void insertComment(BoardCommentBean commentBean);
    void deleteComment(int commentId);
    void updateComment(BoardCommentBean commentBean);
}