package com.portflux.backend.service;

import com.portflux.backend.dto.CommentDto;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.mapper.CommentMapper;
import com.portflux.backend.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;  // ✅ import 추가
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CommentService {

    private final CommentMapper commentMapper;
    private final UserMapper userMapper;  // ✅ final 선언

    @Autowired
    public CommentService(CommentMapper commentMapper, UserMapper userMapper) {  // ✅ 생성자에 UserMapper 추가
        this.commentMapper = commentMapper;
        this.userMapper = userMapper;  // ✅ 초기화
    }

    /**
     * 게시물 ID로 댓글 목록 조회 (작성자 이미지 포함)
     */
    public List<CommentDto> getCommentsByPostId(int postId) {
        List<CommentDto> comments = commentMapper.findCommentsByPostId(postId);
        
        // ✅ 각 댓글 작성자의 이미지를 Base64로 변환
        for (CommentDto comment : comments) {
            UserBean user = userMapper.selectUserByNum(comment.getUserNum());
            if (user != null) {
                // 프로필 이미지 Base64 변환
                if (user.getUserImage() != null) {
                    String base64Image = Base64.getEncoder().encodeToString(user.getUserImage());
                    comment.setUserImageBase64(base64Image);
                }
                // 닉네임 최신 정보로 업데이트
                comment.setUserNickname(user.getUserNickname());
            }
        }
        
        return comments;  // ✅ 수정된 리스트 반환
    }

    /**
     * 새 댓글 추가
     */
    @Transactional
    public CommentDto addComment(int postId, int userNum, String content) {
        CommentDto comment = new CommentDto();
        comment.setPostId(postId);
        comment.setUserNum(userNum);
        comment.setCommentContent(content);
        
        commentMapper.addComment(comment);
        
        // ✅ 작성자 이미지 포함하여 반환
        UserBean user = userMapper.selectUserByNum(userNum);
        if (user != null) {
            comment.setUserNickname(user.getUserNickname());
            if (user.getUserImage() != null) {
                String base64Image = Base64.getEncoder().encodeToString(user.getUserImage());
                comment.setUserImageBase64(base64Image);
            }
        }
        
        return comment;
    }

    /**
     * 댓글 삭제
     */
    @Transactional
    public void deleteComment(int commentId, Long userNum) throws IllegalAccessException {
        CommentDto comment = commentMapper.findCommentById(commentId);
        
        if (comment == null) {
            throw new NoSuchElementException("댓글을 찾을 수 없습니다.");
        }
        
        // ✅ Integer와 Long 비교 수정
        if (!comment.getUserNum().equals(userNum.intValue())) {
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