package com.portflux.backend.service;

import com.portflux.backend.dto.CommentDto;
import com.portflux.backend.mapper.CommentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

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

    /**
     * 새 댓글 추가
     * @param postId 게시물 ID
     * @param userNum 사용자 번호
     * @param content 댓글 내용
     * @return 생성된 댓글 DTO
     */
    @Transactional
    public CommentDto addComment(int postId, int userNum, String content) {
        CommentDto comment = new CommentDto();
        comment.setPostId(postId);
        comment.setUserNum(userNum);
        comment.setCommentContent(content);
        
        commentMapper.addComment(comment);
        
        // MyBatis의 selectKey에 의해 commentId가 채워진 DTO를 반환합니다.
        return comment;
    }

    /**
     * 댓글 삭제
     * @param commentId 댓글 ID
     * @param userNum 현재 로그인한 사용자의 번호
     * @throws IllegalAccessException 사용자가 댓글의 소유자가 아닐 경우
     */
    @Transactional
    public void deleteComment(int commentId, Long userNum) throws IllegalAccessException {
        CommentDto comment = commentMapper.findCommentById(commentId);
        if (comment == null) {
            throw new NoSuchElementException("댓글을 찾을 수 없습니다.");
        }
        // int와 Long을 비교하기 위해 Long을 long으로 변환하거나, int를 long으로 변환하여 비교합니다.
        if (comment.getUserNum() != userNum) {
            throw new IllegalAccessException("이 댓글을 삭제할 권한이 없습니다.");
        }
        commentMapper.deleteComment(commentId);
    }

    /**
     * 특정 사용자의 댓글 목록 조회
     * @param userNum 사용자 번호
     * @return List<CommentDto>
     */
    public List<CommentDto> getCommentsByUserNum(int userNum) {
        return commentMapper.findCommentsByUserNum(userNum);
    }
}

