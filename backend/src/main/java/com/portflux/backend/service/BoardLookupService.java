package com.portflux.backend.service;

import com.portflux.backend.beans.BoardLookupPostDto;
import com.portflux.backend.mapper.BoardLookupMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class BoardLookupService {

    private final BoardLookupMapper boardLookupMapper;

    @Autowired
    public BoardLookupService(BoardLookupMapper boardLookupMapper) {
        this.boardLookupMapper = boardLookupMapper;
    }

    /**
     * 게시글 상세 조회 + 조회수 증가
     */
    @Transactional
    public BoardLookupPostDto getPostById(int postId) {
        // 조회수 증가
        boardLookupMapper.incrementViewCount(postId);
        
        // 게시글 정보 조회
        return boardLookupMapper.findPostById(postId);
    }

    /**
     * 전체 게시글 목록 조회
     */
    public List<BoardLookupPostDto> getAllLookupPosts() {
        return boardLookupMapper.findAllLookupPosts();
    }

    /**
     * 게시글 작성
     */
    public BoardLookupPostDto createPost(BoardLookupPostDto post) {
        boardLookupMapper.insertPost(post);
        return post;
    }

    /**
     * 게시글 수정
     */
    @Transactional
    public BoardLookupPostDto updatePost(BoardLookupPostDto postDto, Long userNum) throws IllegalAccessException {
        BoardLookupPostDto existingPost = boardLookupMapper.findPostById(postDto.getPostId());
        if (existingPost == null) {
            throw new NoSuchElementException("게시글을 찾을 수 없습니다.");
        }
        if (existingPost.getUserNum() != userNum) {
            throw new IllegalAccessException("이 게시글을 수정할 권한이 없습니다.");
        }
        boardLookupMapper.updatePost(postDto);
        return boardLookupMapper.findPostById(postDto.getPostId());
    }

    /**
     * 게시글 삭제
     */
    @Transactional
    public void deletePost(int postId, Long userNum) throws IllegalAccessException {
        BoardLookupPostDto post = boardLookupMapper.findPostById(postId);
        if (post == null) {
            throw new NoSuchElementException("게시글을 찾을 수 없습니다.");
        }
        if (post.getUserNum() != userNum) {
            throw new IllegalAccessException("이 게시글을 삭제할 권한이 없습니다.");
        }
        boardLookupMapper.deletePost(postId);
    }

    /**
     * 특정 사용자의 게시글 목록 조회
     */
    public List<BoardLookupPostDto> getPostsByUserNum(int userNum) {
        return boardLookupMapper.findPostsByUserNum(userNum);
    }
}