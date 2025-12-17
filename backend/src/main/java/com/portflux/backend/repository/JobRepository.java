package com.portflux.backend.repository;

import com.portflux.backend.dto.JobDto;
import com.portflux.backend.dto.JobFilterDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 채용공고 MyBatis Repository
 */
@Mapper
public interface JobRepository {
    
    // 목록 조회 (필터링, 페이징)
    List<JobDto> findJobs(@Param("filter") JobFilterDto filter);
    
    // 총 개수 조회
    int countJobs(@Param("filter") JobFilterDto filter);
    
    // 상세 조회
    JobDto findJobById(@Param("postId") Long postId);
    
    // 생성
    void insertJob(@Param("job") JobDto job);
    
    // 수정
    void updateJob(@Param("job") JobDto job);
    
    // 삭제
    void deleteJob(@Param("postId") Long postId);
    
    // 상태 변경
    void updateJobStatus(@Param("postId") Long postId, @Param("status") String status);
    
    // 조회수 증가
    void incrementViewCount(@Param("postId") Long postId);
    
    // 북마크 추가
    void insertBookmark(@Param("userNum") Long userNum, @Param("postId") Long postId);
    
    // 북마크 삭제
    void deleteBookmark(@Param("userNum") Long userNum, @Param("postId") Long postId);
    
    // 북마크 존재 여부
    boolean existsBookmark(@Param("userNum") Long userNum, @Param("postId") Long postId);
    
    // 북마크 목록 조회
    List<JobDto> findBookmarks(@Param("userNum") Long userNum, @Param("offset") int offset, @Param("limit") int limit);
    
    // 북마크 개수
    int countBookmarks(@Param("userNum") Long userNum);
    
    // 지역별 채용공고 개수
    List<Map<String, Object>> countJobsByRegion();
    
    // 내 채용공고 목록 (기업용)
    List<JobDto> findMyJobs(@Param("companyNum") Long companyNum, @Param("offset") int offset, @Param("limit") int limit);
    
    // 내 채용공고 개수 (기업용)
    int countMyJobs(@Param("companyNum") Long companyNum);
    
    // 만료된 공고 상태 변경 (스케줄러용)
    int expireJobs();
    
    // 소유자 확인
    boolean isJobOwner(@Param("postId") Long postId, @Param("companyNum") Long companyNum);
}