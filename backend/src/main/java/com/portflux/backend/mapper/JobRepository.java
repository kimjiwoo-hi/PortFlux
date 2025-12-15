package com.portflux.backend.mapper;

import com.portflux.backend.beans.JobDto;
import com.portflux.backend.beans.JobFilterDto;
import com.portflux.backend.beans.JobCreateRequest;
import org.apache.ibatis.annotations.Mapper;  // ← import 추가
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 채용공고 Repository (MyBatis Mapper)
 */
@Mapper  // ← 어노테이션 추가
public interface JobRepository {
    
    /**
     * 채용공고 목록 조회 (필터링, 페이징)
     * @param filter 필터 조건
     * @param userNum 현재 로그인한 사용자 ID (북마크 여부 확인용, null 가능)
     * @return 채용공고 목록
     */
    List<JobDto> findJobs(@Param("filter") JobFilterDto filter, @Param("userNum") Long userNum);
    
    /**
     * 채용공고 총 개수 조회
     * @param filter 필터 조건
     * @return 총 개수
     */
    int countJobs(@Param("filter") JobFilterDto filter);
    
    /**
     * 채용공고 상세 조회
     * @param postId 게시글 ID
     * @param userNum 현재 로그인한 사용자 ID (북마크 여부 확인용, null 가능)
     * @return 채용공고 상세
     */
    JobDto findJobById(@Param("postId") Long postId, @Param("userNum") Long userNum);
    
    /**
     * 채용공고 생성
     * @param request 채용공고 데이터
     * @param companyNum 기업 ID
     * @return 생성된 행 수
     */
    int insertJob(@Param("request") JobCreateRequest request, @Param("companyNum") Long companyNum);
    
    /**
     * 채용공고 수정
     * @param postId 게시글 ID
     * @param request 수정할 데이터
     * @return 수정된 행 수
     */
    int updateJob(@Param("postId") Long postId, @Param("request") JobCreateRequest request);
    
    /**
     * 채용공고 삭제
     * @param postId 게시글 ID
     * @return 삭제된 행 수
     */
    int deleteJob(@Param("postId") Long postId);
    
    /**
     * 채용공고 상태 변경
     * @param postId 게시글 ID
     * @param status 변경할 상태 (ACTIVE/CLOSED)
     * @return 수정된 행 수
     */
    int updateJobStatus(@Param("postId") Long postId, @Param("status") String status);
    
    /**
     * 조회수 증가
     * @param postId 게시글 ID
     * @return 수정된 행 수
     */
    int incrementViewCount(@Param("postId") Long postId);
    
    /**
     * 북마크 추가
     * @param postId 게시글 ID
     * @param userNum 사용자 ID
     * @return 추가된 행 수
     */
    int insertBookmark(@Param("postId") Long postId, @Param("userNum") Long userNum);
    
    /**
     * 북마크 삭제
     * @param postId 게시글 ID
     * @param userNum 사용자 ID
     * @return 삭제된 행 수
     */
    int deleteBookmark(@Param("postId") Long postId, @Param("userNum") Long userNum);
    
    /**
     * 북마크 여부 확인
     * @param postId 게시글 ID
     * @param userNum 사용자 ID
     * @return 북마크 존재 여부 (1: 존재, 0: 없음)
     */
    int existsBookmark(@Param("postId") Long postId, @Param("userNum") Long userNum);
    
    /**
     * 북마크 목록 조회
     * @param userNum 사용자 ID
     * @param offset 시작 위치
     * @param limit 조회 개수
     * @return 북마크한 채용공고 목록
     */
    List<JobDto> findBookmarks(@Param("userNum") Long userNum, @Param("offset") int offset, @Param("limit") int limit);
    
    /**
     * 북마크 총 개수
     * @param userNum 사용자 ID
     * @return 북마크 개수
     */
    int countBookmarks(@Param("userNum") Long userNum);
    
    /**
     * 지역별 채용공고 개수
     * @return Map<지역ID, 개수>
     */
    List<Map<String, Object>> countJobsByRegion();
    
    /**
     * 내가 작성한 채용공고 목록
     * @param companyNum 기업 ID
     * @param offset 시작 위치
     * @param limit 조회 개수
     * @return 내 채용공고 목록
     */
    List<JobDto> findMyJobs(@Param("companyNum") Long companyNum, @Param("offset") int offset, @Param("limit") int limit);
    
    /**
     * 내가 작성한 채용공고 총 개수
     * @param companyNum 기업 ID
     * @return 총 개수
     */
    int countMyJobs(@Param("companyNum") Long companyNum);
    
    /**
     * 마감일 지난 공고 자동 만료 처리
     * @return 만료 처리된 행 수
     */
    int expireJobs();
    
    /**
     * 채용공고 작성자 확인
     * @param postId 게시글 ID
     * @param companyNum 기업 ID
     * @return 존재 여부 (1: 본인 작성, 0: 타인 작성)
     */
    int isJobOwner(@Param("postId") Long postId, @Param("companyNum") Long companyNum);
}