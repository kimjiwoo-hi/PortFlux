package com.portflux.backend.service;

import com.portflux.backend.beans.BoardLookupPostDto;
import com.portflux.backend.mapper.BoardLookupMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BoardLookupService {

    private final BoardLookupMapper boardLookupMapper;

    @Autowired
    public BoardLookupService(BoardLookupMapper boardLookupMapper) {
        this.boardLookupMapper = boardLookupMapper;
    }

    /**
     * 게시글 상세 조회 + 조회수 증가
     * @param postId
     * @return BoardLookupPostDto
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
     * @return List<BoardLookupPostDto>
     */
    public List<BoardLookupPostDto> getAllLookupPosts() {
        return boardLookupMapper.findAllLookupPosts();
    }

    /**
     * 게시글 작성
     * @param post
     * @return 생성된 게시글 DTO
     */
    public BoardLookupPostDto createPost(BoardLookupPostDto post) {
        boardLookupMapper.insertPost(post);
        return post; // DTO 객체 자체를 반환
    }
}