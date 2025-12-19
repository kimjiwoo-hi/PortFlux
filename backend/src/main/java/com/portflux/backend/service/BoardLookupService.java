package com.portflux.backend.service;

import com.portflux.backend.beans.BoardLookupPostDto;
import com.portflux.backend.mapper.BoardLookupMapper;
import com.portflux.backend.mapper.UserMapper;

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

    /**
     * 게시글 수정
     * @param postDto 수정할 게시글 정보
     * @param userNum 현재 로그인한 사용자의 번호
     * @return 수정된 게시글 DTO
     * @throws IllegalAccessException 사용자가 게시글의 소유자가 아닐 경우
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
     * @param postId 삭제할 게시글 ID
     * @param userNum 현재 로그인한 사용자의 번호
     * @throws IllegalAccessException 사용자가 게시글의 소유자가 아닐 경우
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


   @Autowired
private UserMapper userMapper;

public void createPost(BoardLookupPostDto postDto, String userId) {
    Integer userNum = userMapper.findUserNumByUserId(userId);

    if (userNum == null) {
        throw new RuntimeException("존재하지 않는 사용자입니다.");
    }

    postDto.setUserNum(userNum);
    boardLookupMapper.insertPost(postDto);
}

}