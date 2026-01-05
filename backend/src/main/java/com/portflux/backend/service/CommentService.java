package com.portflux.backend.service;

import com.portflux.backend.dto.CommentDto;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.CompanyUserBean;
import com.portflux.backend.mapper.CommentMapper;
import com.portflux.backend.mapper.UserMapper;
import com.portflux.backend.mapper.CompanyUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CommentService {

    private final CommentMapper commentMapper;
    private final UserMapper userMapper;
    private final CompanyUserMapper companyUserMapper;

    @Autowired
    public CommentService(CommentMapper commentMapper, UserMapper userMapper, CompanyUserMapper companyUserMapper) {
        this.commentMapper = commentMapper;
        this.userMapper = userMapper;
        this.companyUserMapper = companyUserMapper;
    }

    /**
     * 게시물 ID로 댓글 목록 조회 (작성자 이미지 포함)
     */
    public List<CommentDto> getCommentsByPostId(int postId) {
        List<CommentDto> comments = commentMapper.findCommentsByPostId(postId);

        for (CommentDto comment : comments) {
            UserBean user = userMapper.selectUserByNum(comment.getUserNum());
            if (user != null) {
                // 일반 회원
                if (user.getUserImage() != null) {
                    String base64Image = Base64.getEncoder().encodeToString(user.getUserImage());
                    comment.setUserImageBase64(base64Image);
                }
                comment.setUserNickname(user.getUserNickname());
            } else {
                // 기업 회원 조회
                CompanyUserBean company = companyUserMapper.getCompanyUserByNum(comment.getUserNum());
                if (company != null) {
                    comment.setUserNickname(company.getCompanyName());
                }
            }
        }

        return comments;
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

        // 작성자 정보 조회
        UserBean user = userMapper.selectUserByNum(userNum);
        if (user != null) {
            comment.setUserNickname(user.getUserNickname());
            if (user.getUserImage() != null) {
                String base64Image = Base64.getEncoder().encodeToString(user.getUserImage());
                comment.setUserImageBase64(base64Image);
            }
        } else {
            // 기업 회원 조회
            CompanyUserBean company = companyUserMapper.getCompanyUserByNum(userNum);
            if (company != null) {
                comment.setUserNickname(company.getCompanyName());
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

    /**
     * 닉네임으로 사용자의 댓글 목록 조회
     * @param nickname 사용자 닉네임
     * @return List<CommentDto>
     */
    public List<CommentDto> getCommentsByNickname(String nickname) {
        return commentMapper.findCommentsByNickname(nickname);
    }
}