package com.portflux.backend.service;

import com.portflux.backend.beans.JobDto;
import com.portflux.backend.beans.JobFilterDto;
import com.portflux.backend.mapper.JobRepository;
import com.portflux.backend.beans.JobCreateRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 채용공고 서비스
 */
@Service
public class JobService {
    
    @Autowired
    private JobRepository jobRepository;
    
    /**
     * 채용공고 목록 조회
     * @param filter 필터 조건
     * @param userNum 현재 로그인한 사용자 ID (null 가능)
     * @return Map { content: List<JobDto>, totalElements: int, totalPages: int }
     */
    public Map<String, Object> getJobs(JobFilterDto filter, Long userNum) {
        List<JobDto> jobs = jobRepository.findJobs(filter, userNum);
        int totalElements = jobRepository.countJobs(filter);
        int totalPages = (int) Math.ceil((double) totalElements / filter.getLimit());
        
        // 추가 정보 계산 (신규, 마감임박, 남은일수)
        LocalDateTime now = LocalDateTime.now();
        for (JobDto job : jobs) {
            // 신규 공고 (3일 이내)
            long daysFromCreated = ChronoUnit.DAYS.between(job.getCreatedAt(), now);
            job.setIsNew(daysFromCreated <= 3);
            
            // 마감 임박 (3일 이내)
            if (job.getJobDeadline() != null) {
                long daysLeft = ChronoUnit.DAYS.between(now, job.getJobDeadline());
                job.setDaysLeft(daysLeft);
                job.setIsDeadlineSoon(daysLeft >= 0 && daysLeft <= 3);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", jobs);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("currentPage", filter.getPage());
        result.put("size", filter.getLimit());
        
        return result;
    }
    
    /**
     * 채용공고 상세 조회 (조회수 증가)
     * @param postId 게시글 ID
     * @param userNum 현재 로그인한 사용자 ID (null 가능)
     * @return 채용공고 상세
     */
    @Transactional
    public JobDto getJobDetail(Long postId, Long userNum) {
        // 조회수 증가
        jobRepository.incrementViewCount(postId);
        
        JobDto job = jobRepository.findJobById(postId, userNum);
        
        if (job != null && job.getJobDeadline() != null) {
            LocalDateTime now = LocalDateTime.now();
            long daysLeft = ChronoUnit.DAYS.between(now, job.getJobDeadline());
            job.setDaysLeft(daysLeft);
            job.setIsDeadlineSoon(daysLeft >= 0 && daysLeft <= 3);
            
            long daysFromCreated = ChronoUnit.DAYS.between(job.getCreatedAt(), now);
            job.setIsNew(daysFromCreated <= 3);
        }
        
        return job;
    }
    
    /**
     * 채용공고 생성 (기업 전용)
     * @param request 채용공고 데이터
     * @param companyNum 기업 ID
     * @return 생성 성공 여부
     */
    @Transactional
    public boolean createJob(JobCreateRequest request, Long companyNum) {
        return jobRepository.insertJob(request, companyNum) > 0;
    }
    
    /**
     * 채용공고 수정 (작성 기업 전용)
     * @param postId 게시글 ID
     * @param request 수정할 데이터
     * @param companyNum 기업 ID
     * @return 수정 성공 여부
     * @throws IllegalAccessException 권한 없음
     */
    @Transactional
    public boolean updateJob(Long postId, JobCreateRequest request, Long companyNum) throws IllegalAccessException {
        // 작성자 확인
        if (jobRepository.isJobOwner(postId, companyNum) == 0) {
            throw new IllegalAccessException("해당 채용공고를 수정할 권한이 없습니다.");
        }
        
        return jobRepository.updateJob(postId, request) > 0;
    }
    
    /**
     * 채용공고 삭제 (작성 기업 전용)
     * @param postId 게시글 ID
     * @param companyNum 기업 ID
     * @return 삭제 성공 여부
     * @throws IllegalAccessException 권한 없음
     */
    @Transactional
    public boolean deleteJob(Long postId, Long companyNum) throws IllegalAccessException {
        // 작성자 확인
        if (jobRepository.isJobOwner(postId, companyNum) == 0) {
            throw new IllegalAccessException("해당 채용공고를 삭제할 권한이 없습니다.");
        }
        
        return jobRepository.deleteJob(postId) > 0;
    }
    
    /**
     * 채용공고 상태 변경 (작성 기업 전용)
     * @param postId 게시글 ID
     * @param status 변경할 상태 (ACTIVE/CLOSED)
     * @param companyNum 기업 ID
     * @return 변경 성공 여부
     * @throws IllegalAccessException 권한 없음
     */
    @Transactional
    public boolean updateJobStatus(Long postId, String status, Long companyNum) throws IllegalAccessException {
        // 작성자 확인
        if (jobRepository.isJobOwner(postId, companyNum) == 0) {
            throw new IllegalAccessException("해당 채용공고를 수정할 권한이 없습니다.");
        }
        
        return jobRepository.updateJobStatus(postId, status) > 0;
    }
    
    /**
     * 북마크 토글 (로그인한 사용자만)
     * @param postId 게시글 ID
     * @param userNum 사용자 ID
     * @return Map { bookmarked: boolean }
     */
    @Transactional
    public Map<String, Boolean> toggleBookmark(Long postId, Long userNum) {
        boolean exists = jobRepository.existsBookmark(postId, userNum) > 0;
        
        if (exists) {
            jobRepository.deleteBookmark(postId, userNum);
        } else {
            jobRepository.insertBookmark(postId, userNum);
        }
        
        Map<String, Boolean> result = new HashMap<>();
        result.put("bookmarked", !exists);
        return result;
    }
    
    /**
     * 북마크 여부 확인
     * @param postId 게시글 ID
     * @param userNum 사용자 ID
     * @return Map { bookmarked: boolean }
     */
    public Map<String, Boolean> checkBookmarkStatus(Long postId, Long userNum) {
        boolean exists = jobRepository.existsBookmark(postId, userNum) > 0;
        
        Map<String, Boolean> result = new HashMap<>();
        result.put("bookmarked", exists);
        return result;
    }
    
    /**
     * 북마크 목록 조회
     * @param userNum 사용자 ID
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @return Map { content: List<JobDto>, totalElements: int, totalPages: int }
     */
    public Map<String, Object> getBookmarks(Long userNum, int page, int size) {
        int offset = page * size;
        List<JobDto> bookmarks = jobRepository.findBookmarks(userNum, offset, size);
        int totalElements = jobRepository.countBookmarks(userNum);
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", bookmarks);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("currentPage", page);
        result.put("size", size);
        
        return result;
    }
    
    /**
     * 지역별 채용공고 개수
     * @return Map<지역ID, 개수>
     */
    public Map<String, Integer> getJobCountByRegion() {
        List<Map<String, Object>> list = jobRepository.countJobsByRegion();
        
        Map<String, Integer> result = new HashMap<>();
        for (Map<String, Object> item : list) {
            String region = (String) item.get("job_region");
            Number count = (Number) item.get("job_count");
            result.put(region, count.intValue());
        }
        
        return result;
    }
    
    /**
     * 내가 작성한 채용공고 목록
     * @param companyNum 기업 ID
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @return Map { content: List<JobDto>, totalElements: int, totalPages: int }
     */
    public Map<String, Object> getMyJobs(Long companyNum, int page, int size) {
        int offset = page * size;
        List<JobDto> jobs = jobRepository.findMyJobs(companyNum, offset, size);
        int totalElements = jobRepository.countMyJobs(companyNum);
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", jobs);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("currentPage", page);
        result.put("size", size);
        
        return result;
    }
    
    /**
     * 마감일 지난 공고 자동 만료 처리
     * @return 만료 처리된 개수
     */
    @Transactional
    public int expireJobs() {
        return jobRepository.expireJobs();
    }
}