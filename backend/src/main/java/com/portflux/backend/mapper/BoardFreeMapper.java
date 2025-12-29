package com.portflux.backend.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.portflux.backend.beans.BoardFreeBean;
import com.portflux.backend.beans.BoardCommentBean;

@Mapper
public interface BoardFreeMapper {
    // [중요] userNum과 companyNum을 Integer로 변경하여 null 허용 (NPE 방지)
    int checkLike(@Param("postId") int postId, 
                  @Param("userNum") Integer userNum, 
                  @Param("companyNum") Integer companyNum, 
                  @Param("role") String role);
    
    void insertLike(@Param("postId") int postId, 
                    @Param("userNum") Integer userNum, 
                    @Param("companyNum") Integer companyNum, 
                    @Param("role") String role);
    
    void deleteLike(@Param("postId") int postId, 
                    @Param("userNum") Integer userNum, 
                    @Param("companyNum") Integer companyNum, 
                    @Param("role") String role);

    void increaseLikeCount(int postId);
    void decreaseLikeCount(int postId);

    List<BoardFreeBean> getBoardList(@Param("keyword") String keyword);
    void insertBoard(BoardFreeBean bean);
    BoardFreeBean getBoardDetail(int postId);
    void increaseViewCount(int postId);
    void updateBoard(BoardFreeBean bean);
    void deleteBoard(int postId);

    List<BoardCommentBean> getCommentList(int postId);
    void insertComment(BoardCommentBean commentBean);
    void deleteComment(int commentId);
    void updateComment(BoardCommentBean commentBean);
}