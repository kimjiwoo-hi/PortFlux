package com.portflux.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portflux.backend.dto.JobCreateRequest;
import com.portflux.backend.dto.JobDto;
import com.portflux.backend.dto.JobFilterDto;
import com.portflux.backend.service.JobService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 채용공고 REST Controller
 */
@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class JobController {

    @Autowired
    private JobService jobService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 채용공고 목록 조회
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getJobs(
            @RequestParam(required = false) String regions,
            @RequestParam(required = false) String careerType,
            @RequestParam(required = false) String careerYears,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) Boolean educationExclude,
            @RequestParam(required = false) String industries,
            @RequestParam(required = false) String companyTypes,
            @RequestParam(required = false) String workTypes,
            @RequestParam(required = false) String workDays,
            @RequestParam(required = false) Integer salaryMin,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "latest") String sort,
            HttpSession session) {
        
        try {
            JobFilterDto filter = new JobFilterDto();
            filter.setPage(page);
            filter.setSize(size);
            filter.setSort(sort);
            
            // JSON 배열 파라미터 파싱
            if (regions != null && !regions.isEmpty()) {
                filter.setRegions(objectMapper.readValue(regions, new TypeReference<List<String>>() {}));
            }
            if (careerType != null && !careerType.isEmpty()) {
                filter.setCareerType(objectMapper.readValue(careerType, new TypeReference<List<String>>() {}));
            }
            if (careerYears != null && !careerYears.isEmpty()) {
                filter.setCareerYears(objectMapper.readValue(careerYears, new TypeReference<List<String>>() {}));
            }
            if (industries != null && !industries.isEmpty()) {
                filter.setIndustries(objectMapper.readValue(industries, new TypeReference<List<String>>() {}));
            }
            if (companyTypes != null && !companyTypes.isEmpty()) {
                filter.setCompanyTypes(objectMapper.readValue(companyTypes, new TypeReference<List<String>>() {}));
            }
            if (workTypes != null && !workTypes.isEmpty()) {
                filter.setWorkTypes(objectMapper.readValue(workTypes, new TypeReference<List<String>>() {}));
            }
            if (workDays != null && !workDays.isEmpty()) {
                filter.setWorkDays(objectMapper.readValue(workDays, new TypeReference<List<String>>() {}));
            }
            
            filter.setEducation(education);
            filter.setEducationExclude(educationExclude);
            filter.setSalaryMin(salaryMin);
            filter.setKeyword(keyword);
            
            // 세션에서 사용자 정보 가져오기
            Long userNum = (Long) session.getAttribute("userNum");
            filter.setUserNum(userNum);
            
            Map<String, Object> result = jobService.getJobs(filter);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 채용공고 상세 조회
     */
    @GetMapping("/{postId}")
    public ResponseEntity<?> getJobDetail(@PathVariable Long postId, HttpSession session) {
        try {
            Long userNum = (Long) session.getAttribute("userNum");
            JobDto job = jobService.getJobDetail(postId, userNum);
            
            if (job == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "채용공고를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // 소유자 여부 추가
            Long companyNum = (Long) session.getAttribute("companyNum");
            boolean isOwner = jobService.isOwner(postId, companyNum);
            
            Map<String, Object> result = new HashMap<>();
            result.put("job", job);
            result.put("isOwner", isOwner);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "상세 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 채용공고 생성 (기업 전용)
     */
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobCreateRequest request, HttpSession session) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            JobDto created = jobService.createJob(companyNum, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "채용공고 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 채용공고 수정 (작성 기업 전용)
     */
    @PutMapping("/{postId}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long postId,
            @RequestBody JobCreateRequest request,
            HttpSession session) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            JobDto updated = jobService.updateJob(postId, companyNum, request);
            return ResponseEntity.ok(updated);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "채용공고 수정 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 채용공고 삭제 (작성 기업 전용)
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deleteJob(@PathVariable Long postId, HttpSession session) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            jobService.deleteJob(postId, companyNum);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "삭제되었습니다.");
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "채용공고 삭제 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 채용공고 상태 변경
     */
    @PatchMapping("/{postId}/status")
    public ResponseEntity<?> updateJobStatus(
            @PathVariable Long postId,
            @RequestBody Map<String, String> body,
            HttpSession session) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            String status = body.get("status");
            if (status == null || (!status.equals("ACTIVE") && !status.equals("CLOSED"))) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "유효하지 않은 상태값입니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            jobService.updateJobStatus(postId, companyNum, status);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "상태가 변경되었습니다.");
            result.put("status", status);
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "상태 변경 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 북마크 토글
     */
    @PostMapping("/{postId}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long postId, HttpSession session) {
        try {
            Long userNum = (Long) session.getAttribute("userNum");
            
            if (userNum == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            boolean bookmarked = jobService.toggleBookmark(userNum, postId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("bookmarked", bookmarked);
            result.put("message", bookmarked ? "북마크에 추가되었습니다." : "북마크가 해제되었습니다.");
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "북마크 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 북마크 상태 확인
     */
    @GetMapping("/{postId}/bookmark/status")
    public ResponseEntity<?> checkBookmarkStatus(@PathVariable Long postId, HttpSession session) {
        try {
            Long userNum = (Long) session.getAttribute("userNum");
            
            if (userNum == null) {
                Map<String, Object> result = new HashMap<>();
                result.put("bookmarked", false);
                return ResponseEntity.ok(result);
            }
            
            boolean bookmarked = jobService.checkBookmarkStatus(userNum, postId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("bookmarked", bookmarked);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "북마크 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 북마크 목록 조회
     */
    @GetMapping("/bookmarks")
    public ResponseEntity<?> getBookmarks(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            HttpSession session) {
        try {
            Long userNum = (Long) session.getAttribute("userNum");
            
            if (userNum == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Map<String, Object> result = jobService.getBookmarks(userNum, page, size);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "북마크 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 지역별 채용공고 개수 조회
     */
    @GetMapping("/count-by-region")
    public ResponseEntity<?> getJobCountByRegion() {
        try {
            Map<String, Integer> result = jobService.getJobCountByRegion();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "지역별 개수 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 내 채용공고 목록 (기업 전용)
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyJobs(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            HttpSession session) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Map<String, Object> result = jobService.getMyJobs(companyNum, page, size);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "내 채용공고 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}