package com.portflux.backend.mapper;

import com.portflux.backend.beans.CommentDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommentMapper {

    /**
     * 게시물 ID로 댓글 목록 조회
     * @param postId
     * @return List<CommentDto>
     */
    List<CommentDto> findCommentsByPostId(@Param("postId") int postId);

    /**
     * 새 댓글 추가
     * @param comment 댓글 정보
     */
    void addComment(CommentDto comment);

    /**
     * 댓글 ID로 댓글 조회
     * @param commentId 댓글 ID
     * @return CommentDto
     */
    CommentDto findCommentById(@Param("commentId") int commentId);

    /**
     * 댓글 삭제
     * @param commentId 댓글 ID
     */
    void deleteComment(@Param("commentId") int commentId);

}
