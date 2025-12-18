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

}