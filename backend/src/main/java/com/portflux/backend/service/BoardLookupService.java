package com.portflux.backend.service;

import com.portflux.backend.beans.BoardLookupPostDto;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.mapper.BoardLookupMapper;
import com.portflux.backend.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class BoardLookupService {

    private final BoardLookupMapper boardLookupMapper;
    private final UserMapper userMapper;

    @Autowired
    public BoardLookupService(BoardLookupMapper boardLookupMapper, UserMapper userMapper) {
        this.boardLookupMapper = boardLookupMapper;
        this.userMapper = userMapper;
    }

    /**
     * 게시글 상세 조회 (작성자 이미지 포함)
     */
    public BoardLookupPostDto getPostById(int postId) {
        BoardLookupPostDto post = boardLookupMapper.findPostById(postId);  // ✅ 변경
        
        if (post != null) {
            // 작성자 정보 조회 및 이미지 Base64 변환
            UserBean author = userMapper.selectUserByNum(post.getUserNum());
            if (author != null) {
                // 프로필 이미지 Base64 변환
                if (author.getUserImage() != null) {
                    String base64Image = Base64.getEncoder().encodeToString(author.getUserImage());
                    post.setUserImageBase64(base64Image);
                }
                
                // 배너 이미지 Base64 변환
                if (author.getUserBanner() != null) {
                    String base64Banner = Base64.getEncoder().encodeToString(author.getUserBanner());
                    post.setUserBannerBase64(base64Banner);
                }
                
                // 닉네임 업데이트
                post.setUserNickname(author.getUserNickname());
            }
            
            // 조회수 증가
            boardLookupMapper.incrementViewCount(postId);
        }
        
        return post;
    }

    /**
     * 전체 게시글 목록 조회 (각 게시글 작성자 이미지 포함)
     */
    public List<BoardLookupPostDto> getAllLookupPosts() {
        List<BoardLookupPostDto> posts = boardLookupMapper.findAllLookupPosts();
        
        // 각 게시글의 작성자 이미지 추가
        for (BoardLookupPostDto post : posts) {
            UserBean author = userMapper.selectUserByNum(post.getUserNum());
            if (author != null) {
                // 프로필 이미지
                if (author.getUserImage() != null) {
                    String base64Image = Base64.getEncoder().encodeToString(author.getUserImage());
                    post.setUserImageBase64(base64Image);
                }
                // 닉네임
                post.setUserNickname(author.getUserNickname());
            }
        }
        
        return posts;
    }

    /**
     * 게시글 작성
     */
    @Transactional
    public void createPost(BoardLookupPostDto post) {
        boardLookupMapper.insertPost(post);
    }

    /**
     * 게시글 수정
     */
    @Transactional
    public BoardLookupPostDto updatePost(BoardLookupPostDto postDto, Long userNum) throws IllegalAccessException {
        BoardLookupPostDto existingPost = boardLookupMapper.findPostById(postDto.getPostId());  // ✅ 변경
        
        if (existingPost == null) {
            throw new NoSuchElementException("게시글을 찾을 수 없습니다.");
        }
        
        if (!existingPost.getUserNum().equals(userNum.intValue())) {
            throw new IllegalAccessException("이 게시글을 수정할 권한이 없습니다.");
        }
        
        boardLookupMapper.updatePost(postDto);
        return boardLookupMapper.findPostById(postDto.getPostId());  // ✅ 변경
    }

    /**
     * 게시글 삭제
     */
    @Transactional
    public void deletePost(int postId, Long userNum) throws IllegalAccessException {
        BoardLookupPostDto post = boardLookupMapper.findPostById(postId);  // ✅ 변경
        
        if (post == null) {
            throw new NoSuchElementException("게시글을 찾을 수 없습니다.");
        }
        
        if (!post.getUserNum().equals(userNum.intValue())) {
            throw new IllegalAccessException("이 게시글을 삭제할 권한이 없습니다.");
        }
        
        boardLookupMapper.deletePost(postId);
    }
}