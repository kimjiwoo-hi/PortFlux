package com.portflux.backend.service;

import com.portflux.backend.dto.BoardLookupPostDto;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.CompanyUserBean;
import com.portflux.backend.mapper.BoardLookupMapper;
import com.portflux.backend.mapper.UserMapper;
import com.portflux.backend.mapper.CompanyUserMapper;
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
    private final CompanyUserMapper companyUserMapper;
    private static final int MAX_TITLE_LENGTH = 15;

    @Autowired
    public BoardLookupService(BoardLookupMapper boardLookupMapper, UserMapper userMapper, CompanyUserMapper companyUserMapper) {
        this.boardLookupMapper = boardLookupMapper;
        this.userMapper = userMapper;
        this.companyUserMapper = companyUserMapper;
    }

    /**
     * 게시글 상세 조회 (작성자 이미지 포함)
     */
    public BoardLookupPostDto getPostById(int postId) {
        BoardLookupPostDto post = boardLookupMapper.findPostById(postId);

        if (post != null) {
            // 작성자 정보 조회 및 Base64 변환
            if (post.getUserNum() != null) {
                // 일반 회원
                UserBean author = userMapper.selectUserByNum(post.getUserNum());
                if (author != null) {
                    if (author.getUserImage() != null) {
                        String base64Image = Base64.getEncoder().encodeToString(author.getUserImage());
                        post.setUserImageBase64(base64Image);
                    }
                    if (author.getUserBanner() != null) {
                        String base64Banner = Base64.getEncoder().encodeToString(author.getUserBanner());
                        post.setUserBannerBase64(base64Banner);
                    }
                    post.setUserNickname(author.getUserNickname());
                }
            } else if (post.getCompanyNum() != null) {
                // 기업 회원 조회
                CompanyUserBean company = companyUserMapper.getCompanyUserByNum(post.getCompanyNum());
                if (company != null) {
                    post.setUserNickname(company.getCompanyName());
                }
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

        // 각 게시글의 작성자 이미지 및 배너 추가
        for (BoardLookupPostDto post : posts) {
            if (post.getUserNum() != null) {
                // 일반 회원
                // 프로필 이미지 Base64 변환
                UserBean author = userMapper.selectUserByNum(post.getUserNum());
                if (author != null) {
                    if (author.getUserImage() != null) {
                        String base64Image = Base64.getEncoder().encodeToString(author.getUserImage());
                        post.setUserImageBase64(base64Image);
                    }
                    // 배너 이미지 Base64 변환
                    if (author.getUserBanner() != null) {
                        String base64Banner = Base64.getEncoder().encodeToString(author.getUserBanner());
                        post.setUserBannerBase64(base64Banner);
                    }
                    // 닉네임
                    post.setUserNickname(author.getUserNickname());
                }
            } else if (post.getCompanyNum() != null) {
                // 기업 회원 조회
                CompanyUserBean company = companyUserMapper.getCompanyUserByNum(post.getCompanyNum());
                if (company != null) {
                    post.setUserNickname(company.getCompanyName());
                }
            }
        }

        return posts;
    }

    /**
     * 게시글 작성
     */
    @Transactional
    public void createPost(BoardLookupPostDto post) {
        validateTitle(post.getTitle());
        boardLookupMapper.insertPost(post);
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

        // 권한 검사: 일반 userNum, 기업 companyNum으로 모두 확인
        boolean hasPermission = (existingPost.getUserNum() != null && existingPost.getUserNum().equals(userNum.intValue())) ||
                               (existingPost.getCompanyNum() != null && existingPost.getCompanyNum().equals(userNum.intValue()));

        if (!hasPermission) {
            throw new IllegalAccessException("이 게시글을 수정할 권한이 없습니다.");
        }

        validateTitle(postDto.getTitle());

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

        // 권한 검사: 일반 userNum, 기업 companyNum으로 모두 확인
        boolean hasPermission = (post.getUserNum() != null && post.getUserNum().equals(userNum.intValue())) ||
                               (post.getCompanyNum() != null && post.getCompanyNum().equals(userNum.intValue()));

        if (!hasPermission) {
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

    /**
     * 닉네임으로 사용자의 게시글 목록 조회
     */
    public List<BoardLookupPostDto> getPostsByNickname(String nickname) {
        List<BoardLookupPostDto> posts = boardLookupMapper.findPostsByNickname(nickname);

        // 각 게시글의 작성자 이미지 및 배너 추가
        for (BoardLookupPostDto post : posts) {
            if (post.getUserNum() != null) {
                // 일반 회원
                // 프로필 이미지 Base64 변환
                UserBean author = userMapper.selectUserByNum(post.getUserNum());
                if (author != null) {
                    if (author.getUserImage() != null) {
                        String base64Image = Base64.getEncoder().encodeToString(author.getUserImage());
                        post.setUserImageBase64(base64Image);
                    }
                    // 배너 이미지 Base64 변환
                    if (author.getUserBanner() != null) {
                        String base64Banner = Base64.getEncoder().encodeToString(author.getUserBanner());
                        post.setUserBannerBase64(base64Banner);
                    }
                    // 닉네임
                    post.setUserNickname(author.getUserNickname());
                }
            } else if (post.getCompanyNum() != null) {
                // 기업 회원 조회
                CompanyUserBean company = companyUserMapper.getCompanyUserByNum(post.getCompanyNum());
                if (company != null) {
                    post.setUserNickname(company.getCompanyName());
                }
            }
        }

        return posts;
    }

    /**
 * 사용자가 해당 게시물을 구매했는지 확인
 */
public boolean isPurchased(Long userNum, int postId) {
    // PaymentRecord와 Order를 조인하여 확인
    // 실제 구현은 PaymentRepository 또는 OrderRepository에 메서드 추가 필요
    return boardLookupMapper.checkPurchaseStatus(userNum, postId);
}

/**
 * 다운로드 카운트 증가
 */
@Transactional
public void incrementDownloadCount(int postId) {
    boardLookupMapper.incrementDownloadCount(postId);
}

// 제목 글자수 
private void validateTitle(String title) {
    if (title == null || title.trim().isEmpty()) {
        throw new IllegalArgumentException("제목은 필수입니다.");
    }

    if (title.length() > MAX_TITLE_LENGTH) {
        throw new IllegalArgumentException("제목은 최대 15자까지 입력 가능합니다.");
    }
}
}