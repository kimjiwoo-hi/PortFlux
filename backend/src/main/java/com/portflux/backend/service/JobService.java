package com.portflux.backend.service;

import com.portflux.backend.dto.JobCreateRequest;
import com.portflux.backend.dto.JobDto;
import com.portflux.backend.dto.JobFilterDto;
import com.portflux.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 채용공고 서비스
 */
@Service
@Transactional
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    /**
     * 채용공고 목록 조회 (필터링, 페이징)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getJobs(JobFilterDto filter) {
        List<JobDto> jobs = jobRepository.findJobs(filter);
        int totalCount = jobRepository.countJobs(filter);
        
        // 계산된 필드 설정
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();
        
        for (JobDto job : jobs) {
            // isNew: 7일 이내 등록
            if (job.getCreatedAt() != null) {
                long daysSinceCreated = ChronoUnit.DAYS.between(job.getCreatedAt().toLocalDate(), today);
                job.setIsNew(daysSinceCreated <= 7);
            }
            
            // isDeadlineSoon, daysLeft: 마감 3일 이내
            if (job.getJobDeadline() != null) {
                long daysLeft = ChronoUnit.DAYS.between(today, job.getJobDeadline());
                job.setDaysLeft((int) daysLeft);
                job.setIsDeadlineSoon(daysLeft >= 0 && daysLeft <= 3);
            }
            
            // 북마크 여부 확인 (일반 사용자 또는 기업 회원)
            if (filter.getUserNum() != null) {
                job.setIsBookmarked(jobRepository.existsBookmark(filter.getUserNum(), job.getPostId()));
            } else if (filter.getCompanyNum() != null) {
                job.setIsBookmarked(jobRepository.existsCompanyBookmark(filter.getCompanyNum(), job.getPostId()));
            } else {
                job.setIsBookmarked(false);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", jobs);
        result.put("totalElements", totalCount);
        result.put("totalPages", (int) Math.ceil((double) totalCount / filter.getSize()));
        result.put("page", filter.getPage());
        result.put("size", filter.getSize());
        result.put("hasNext", (filter.getPage() + 1) * filter.getSize() < totalCount);
        result.put("hasPrevious", filter.getPage() > 0);
        
        return result;
    }

    /**
     * 채용공고 상세 조회
     */
    @Transactional
    public JobDto getJobDetail(Long postId, Long userNum, Long companyNum) {
        // 조회수 증가
        jobRepository.incrementViewCount(postId);

        JobDto job = jobRepository.findJobById(postId);
        if (job == null) {
            return null;
        }

        // 계산된 필드 설정
        LocalDate today = LocalDate.now();

        if (job.getCreatedAt() != null) {
            long daysSinceCreated = ChronoUnit.DAYS.between(job.getCreatedAt().toLocalDate(), today);
            job.setIsNew(daysSinceCreated <= 7);
        }

        if (job.getJobDeadline() != null) {
            long daysLeft = ChronoUnit.DAYS.between(today, job.getJobDeadline());
            job.setDaysLeft((int) daysLeft);
            job.setIsDeadlineSoon(daysLeft >= 0 && daysLeft <= 3);
        }

        // 북마크 여부 (일반 사용자 또는 기업 회원)
        if (userNum != null) {
            job.setIsBookmarked(jobRepository.existsBookmark(userNum, postId));
        } else if (companyNum != null) {
            job.setIsBookmarked(jobRepository.existsCompanyBookmark(companyNum, postId));
        } else {
            job.setIsBookmarked(false);
        }

        return job;
    }

    /**
     * 채용공고 생성 (기업 전용)
     */
    public JobDto createJob(Long companyNum, JobCreateRequest request) {
        JobDto job = new JobDto();
        job.setCompanyNum(companyNum);
        job.setTitle(request.getTitle());
        job.setContent(request.getContent());
        job.setJobRegion(request.getJobRegion());
        job.setJobCareerType(request.getJobCareerType());
        job.setJobCareerYears(request.getJobCareerYears());
        job.setJobEducation(request.getJobEducation());
        job.setJobEducationExclude(request.getJobEducationExclude());
        job.setJobSalaryMin(request.getJobSalaryMin());
        job.setJobSalaryMax(request.getJobSalaryMax());
        job.setJobDeadline(request.getJobDeadline());
        job.setJobStatus(request.getJobStatus() != null ? request.getJobStatus() : "ACTIVE");
        job.setJobIndustries(request.getJobIndustries());
        job.setJobCompanyTypes(request.getJobCompanyTypes());
        job.setJobWorkTypes(request.getJobWorkTypes());
        job.setJobWorkDays(request.getJobWorkDays());
        job.setCompanyLogo(request.getCompanyLogo());
        job.setCompanyPhone(request.getCompanyPhone());

        jobRepository.insertJob(job);
        
        return jobRepository.findJobById(job.getPostId());
    }

    /**
     * 채용공고 수정 (작성 기업 전용)
     */
    public JobDto updateJob(Long postId, Long companyNum, JobCreateRequest request) {
        // 소유자 확인
        if (!jobRepository.isJobOwner(postId, companyNum)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }
        
        JobDto job = new JobDto();
        job.setPostId(postId);
        job.setTitle(request.getTitle());
        job.setContent(request.getContent());
        job.setJobRegion(request.getJobRegion());
        job.setJobCareerType(request.getJobCareerType());
        job.setJobCareerYears(request.getJobCareerYears());
        job.setJobEducation(request.getJobEducation());
        job.setJobEducationExclude(request.getJobEducationExclude());
        job.setJobSalaryMin(request.getJobSalaryMin());
        job.setJobSalaryMax(request.getJobSalaryMax());
        job.setJobDeadline(request.getJobDeadline());
        job.setJobStatus(request.getJobStatus());
        job.setJobIndustries(request.getJobIndustries());
        job.setJobCompanyTypes(request.getJobCompanyTypes());
        job.setJobWorkTypes(request.getJobWorkTypes());
        job.setJobWorkDays(request.getJobWorkDays());
        job.setCompanyLogo(request.getCompanyLogo());
        job.setCompanyPhone(request.getCompanyPhone());

        jobRepository.updateJob(job);
        
        return jobRepository.findJobById(postId);
    }

    /**
     * 채용공고 삭제 (작성 기업 전용)
     */
    public void deleteJob(Long postId, Long companyNum) {
        // 소유자 확인
        if (!jobRepository.isJobOwner(postId, companyNum)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        
        jobRepository.deleteJob(postId);
    }

    /**
     * 채용공고 상태 변경
     */
    public void updateJobStatus(Long postId, Long companyNum, String status) {
        // 소유자 확인
        if (!jobRepository.isJobOwner(postId, companyNum)) {
            throw new RuntimeException("상태 변경 권한이 없습니다.");
        }
        
        jobRepository.updateJobStatus(postId, status);
    }

    /**
     * 북마크 토글 (일반 사용자)
     */
    public boolean toggleBookmark(Long userNum, Long postId) {
        if (jobRepository.existsBookmark(userNum, postId)) {
            jobRepository.deleteBookmark(userNum, postId);
            return false;
        } else {
            jobRepository.insertBookmark(userNum, postId);
            return true;
        }
    }

    /**
     * 북마크 토글 (기업 회원)
     */
    public boolean toggleCompanyBookmark(Long companyNum, Long postId) {
        if (jobRepository.existsCompanyBookmark(companyNum, postId)) {
            jobRepository.deleteCompanyBookmark(companyNum, postId);
            return false;
        } else {
            jobRepository.insertCompanyBookmark(companyNum, postId);
            return true;
        }
    }

    /**
     * 북마크 상태 확인 (일반 사용자)
     */
    @Transactional(readOnly = true)
    public boolean checkBookmarkStatus(Long userNum, Long postId) {
        return jobRepository.existsBookmark(userNum, postId);
    }

    /**
     * 북마크 상태 확인 (기업 회원)
     */
    @Transactional(readOnly = true)
    public boolean checkCompanyBookmarkStatus(Long companyNum, Long postId) {
        return jobRepository.existsCompanyBookmark(companyNum, postId);
    }

    /**
     * 북마크 목록 조회 (일반 사용자)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getBookmarks(Long userNum, int page, int size) {
        int offset = page * size;
        List<JobDto> jobs = jobRepository.findBookmarks(userNum, offset, size);
        int totalCount = jobRepository.countBookmarks(userNum);

        // 계산된 필드 설정
        LocalDate today = LocalDate.now();
        for (JobDto job : jobs) {
            if (job.getCreatedAt() != null) {
                long daysSinceCreated = ChronoUnit.DAYS.between(job.getCreatedAt().toLocalDate(), today);
                job.setIsNew(daysSinceCreated <= 7);
            }
            if (job.getJobDeadline() != null) {
                long daysLeft = ChronoUnit.DAYS.between(today, job.getJobDeadline());
                job.setDaysLeft((int) daysLeft);
                job.setIsDeadlineSoon(daysLeft >= 0 && daysLeft <= 3);
            }
            job.setIsBookmarked(true);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("content", jobs);
        result.put("totalElements", totalCount);
        result.put("totalPages", (int) Math.ceil((double) totalCount / size));
        result.put("page", page);
        result.put("size", size);

        return result;
    }

    /**
     * 북마크 목록 조회 (기업 회원)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCompanyBookmarks(Long companyNum, int page, int size) {
        int offset = page * size;
        List<JobDto> jobs = jobRepository.findCompanyBookmarks(companyNum, offset, size);
        int totalCount = jobRepository.countCompanyBookmarks(companyNum);

        // 계산된 필드 설정
        LocalDate today = LocalDate.now();
        for (JobDto job : jobs) {
            if (job.getCreatedAt() != null) {
                long daysSinceCreated = ChronoUnit.DAYS.between(job.getCreatedAt().toLocalDate(), today);
                job.setIsNew(daysSinceCreated <= 7);
            }
            if (job.getJobDeadline() != null) {
                long daysLeft = ChronoUnit.DAYS.between(today, job.getJobDeadline());
                job.setDaysLeft((int) daysLeft);
                job.setIsDeadlineSoon(daysLeft >= 0 && daysLeft <= 3);
            }
            job.setIsBookmarked(true);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("content", jobs);
        result.put("totalElements", totalCount);
        result.put("totalPages", (int) Math.ceil((double) totalCount / size));
        result.put("page", page);
        result.put("size", size);

        return result;
    }

    /**
     * 지역별 채용공고 개수 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Integer> getJobCountByRegion() {
        List<Map<String, Object>> regionCounts = jobRepository.countJobsByRegion();
        Map<String, Integer> result = new HashMap<>();

        for (Map<String, Object> row : regionCounts) {
            String region = (String) row.get("JOB_REGION");
            Number count = (Number) row.get("JOB_COUNT");
            if (region != null && count != null) {
                // 하위 지역을 상위 지역으로 매핑 (예: SEOUL_GANGNAM -> SEOUL)
                String mainRegion = region;
                if (region.contains("_")) {
                    mainRegion = region.substring(0, region.indexOf("_"));
                }

                // 상위 지역별로 카운트 집계
                result.put(mainRegion, result.getOrDefault(mainRegion, 0) + count.intValue());
            }
        }

        return result;
    }

    /**
     * 내 채용공고 목록 (기업용)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMyJobs(Long companyNum, int page, int size) {
        int offset = page * size;
        List<JobDto> jobs = jobRepository.findMyJobs(companyNum, offset, size);
        int totalCount = jobRepository.countMyJobs(companyNum);
        
        // 계산된 필드 설정
        LocalDate today = LocalDate.now();
        for (JobDto job : jobs) {
            if (job.getCreatedAt() != null) {
                long daysSinceCreated = ChronoUnit.DAYS.between(job.getCreatedAt().toLocalDate(), today);
                job.setIsNew(daysSinceCreated <= 7);
            }
            if (job.getJobDeadline() != null) {
                long daysLeft = ChronoUnit.DAYS.between(today, job.getJobDeadline());
                job.setDaysLeft((int) daysLeft);
                job.setIsDeadlineSoon(daysLeft >= 0 && daysLeft <= 3);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", jobs);
        result.put("totalElements", totalCount);
        result.put("totalPages", (int) Math.ceil((double) totalCount / size));
        result.put("page", page);
        result.put("size", size);
        
        return result;
    }

    /**
     * 만료된 공고 상태 변경 (스케줄러 호출)
     */
    public int expireJobs() {
        return jobRepository.expireJobs();
    }

    /**
     * 소유자 확인
     */
    @Transactional(readOnly = true)
    public boolean isOwner(Long postId, Long companyNum) {
        if (companyNum == null) {
            return false;
        }
        return jobRepository.isJobOwner(postId, companyNum);
    }
}