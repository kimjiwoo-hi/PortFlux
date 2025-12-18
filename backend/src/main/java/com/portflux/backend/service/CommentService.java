package com.portflux.backend.service;

import com.portflux.backend.beans.CommentDto;
import com.portflux.backend.mapper.CommentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentMapper commentMapper;

    @Autowired
    public CommentService(CommentMapper commentMapper) {
        this.commentMapper = commentMapper;
    }

    /**
     * 게시물 ID로 댓글 목록 조회
     * @param postId
     * @return List<CommentDto>
     */
    public List<CommentDto> getCommentsByPostId(int postId) {
        return commentMapper.findCommentsByPostId(postId);
    }
}