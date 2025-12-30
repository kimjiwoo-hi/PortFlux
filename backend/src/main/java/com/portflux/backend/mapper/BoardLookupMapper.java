package com.portflux.backend.mapper;

import com.portflux.backend.dto.BoardLookupPostDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardLookupMapper {

    /**
     * 게시글 ID로 게시글 상세 조회
     * @param postId 게시글 ID
     * @return BoardLookupPostDto
     */
    BoardLookupPostDto findPostById(@Param("postId") int postId);

    /**
     * 게시글 조회수 증가
     * @param postId 게시글 ID
     */
    void incrementViewCount(@Param("postId") int postId);

    /**
     * 게시글 작성
     * @param post 게시글 정보
     * @return 생성된 행 수
     */
    int insertPost(BoardLookupPostDto post);

    /**
     * 전체 lookup 게시글 목록 조회
     * @return List<BoardLookupPostDto>
     */
    List<BoardLookupPostDto> findAllLookupPosts();

    /**
     * 태그로 게시글 검색 (선택적 기능)
     * @param tags 검색할 태그 목록
     * @return List<BoardLookupPostDto>
     */
    List<BoardLookupPostDto> findPostsByTags(@Param("tags") List<String> tags);

    /**
     * 사용자 번호로 게시글 조회 (선택적 기능)
     * @param userNum 사용자 번호
     * @return List<BoardLookupPostDto>
     */
    List<BoardLookupPostDto> findPostsByUserNum(@Param("userNum") int userNum);

    /**
     * 게시글 수정 (선택적 기능)
     * @param post 수정할 게시글 정보
     */
    void updatePost(BoardLookupPostDto post);

    /**
     * 게시글 삭제 (선택적 기능)
     * @param postId 게시글 ID
     */
    void deletePost(@Param("postId") int postId);

    /**
     * 다운로드 수 증가 (선택적 기능)
     * @param postId 게시글 ID
     */
    void incrementDownloadCount(@Param("postId") int postId);

    /**
 * 사용자의 구매 여부 확인
 */
boolean checkPurchaseStatus(@Param("userNum") Long userNum, @Param("postId") int postId);

}