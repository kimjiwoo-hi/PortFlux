package com.portflux.backend.controller;

import com.portflux.backend.beans.JobDto;
import com.portflux.backend.beans.JobFilterDto;
import com.portflux.backend.beans.JobCreateRequest;
import com.portflux.backend.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

/**
 * 채용공고 컨트롤러
 */
@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class JobController {
    
    @Autowired
    private JobService jobService;
    
    /**
     * 채용공고 목록 조회
     * GET /api/jobs?page=0&size=20&sort=latest&regions=[...]&keyword=...
     */
    @GetMapping
    public ResponseEntity<?> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "latest") String sort,
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
            HttpSession session
    ) {
        try {
            // 현재 로그인한 사용자 ID (북마크 여부 확인용)
            Long userNum = (Long) session.getAttribute("userNum");
            
            // 필터 DTO 생성
            JobFilterDto filter = new JobFilterDto();
            filter.setPage(page);
            filter.setSize(size);
            filter.setSort(sort);
            filter.setRegions(parseJsonArray(regions));
            filter.setCareerType(parseJsonArray(careerType));
            filter.setCareerYears(parseJsonArray(careerYears));
            filter.setEducation(education);
            filter.setEducationExclude(educationExclude);
            filter.setIndustries(parseJsonArray(industries));
            filter.setCompanyTypes(parseJsonArray(companyTypes));
            filter.setWorkTypes(parseJsonArray(workTypes));
            filter.setWorkDays(parseJsonArray(workDays));
            filter.setSalaryMin(salaryMin);
            filter.setKeyword(keyword);
            
            Map<String, Object> result = jobService.getJobs(filter, userNum);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "채용공고 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 채용공고 상세 조회
     * GET /api/jobs/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobDetail(@PathVariable Long id, HttpSession session) {
        try {
            Long userNum = (Long) session.getAttribute("userNum");
            JobDto job = jobService.getJobDetail(id, userNum);
            
            if (job == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "채용공고를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "채용공고 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 채용공고 생성 (기업 전용)
     * POST /api/jobs
     */
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobCreateRequest request, HttpSession session) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            boolean success = jobService.createJob(request, companyNum);
            
            if (success) {
                Map<String, String> result = new HashMap<>();
                result.put("message", "채용공고가 생성되었습니다.");
                return ResponseEntity.status(HttpStatus.CREATED).body(result);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "채용공고 생성에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "채용공고 생성 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 채용공고 수정 (작성 기업 전용)
     * PUT /api/jobs/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long id,
            @RequestBody JobCreateRequest request,
            HttpSession session
    ) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            boolean success = jobService.updateJob(id, request, companyNum);
            
            if (success) {
                Map<String, String> result = new HashMap<>();
                result.put("message", "채용공고가 수정되었습니다.");
                return ResponseEntity.ok(result);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "채용공고 수정에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (IllegalAccessException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "채용공고 수정 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 채용공고 삭제 (작성 기업 전용)
     * DELETE /api/jobs/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id, HttpSession session) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            boolean success = jobService.deleteJob(id, companyNum);
            
            if (success) {
                Map<String, String> result = new HashMap<>();
                result.put("message", "채용공고가 삭제되었습니다.");
                return ResponseEntity.ok(result);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "채용공고 삭제에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (IllegalAccessException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "채용공고 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 채용공고 상태 변경 (작성 기업 전용)
     * PATCH /api/jobs/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateJobStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            HttpSession session
    ) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            String status = request.get("status");
            boolean success = jobService.updateJobStatus(id, status, companyNum);
            
            if (success) {
                Map<String, String> result = new HashMap<>();
                result.put("message", "채용공고 상태가 변경되었습니다.");
                return ResponseEntity.ok(result);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "채용공고 상태 변경에 실패했습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        } catch (IllegalAccessException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "채용공고 상태 변경 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 북마크 토글
     * POST /api/jobs/{id}/bookmark
     */
    @PostMapping("/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long id, HttpSession session) {
        try {
            Long userNum = (Long) session.getAttribute("userNum");
            
            if (userNum == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "사용자 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Map<String, Boolean> result = jobService.toggleBookmark(id, userNum);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "북마크 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 북마크 여부 확인
     * GET /api/jobs/{id}/bookmark/status
     */
    @GetMapping("/{id}/bookmark/status")
    public ResponseEntity<?> checkBookmarkStatus(@PathVariable Long id, HttpSession session) {
        try {
            Long userNum = (Long) session.getAttribute("userNum");
            
            if (userNum == null) {
                Map<String, Boolean> result = new HashMap<>();
                result.put("bookmarked", false);
                return ResponseEntity.ok(result);
            }
            
            Map<String, Boolean> result = jobService.checkBookmarkStatus(id, userNum);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "북마크 상태 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 북마크 목록 조회
     * GET /api/jobs/bookmarks?page=0&size=20
     */
    @GetMapping("/bookmarks")
    public ResponseEntity<?> getBookmarks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        try {
            Long userNum = (Long) session.getAttribute("userNum");
            
            if (userNum == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "사용자 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Map<String, Object> result = jobService.getBookmarks(userNum, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "북마크 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 지역별 채용공고 개수
     * GET /api/jobs/count-by-region
     */
    @GetMapping("/count-by-region")
    public ResponseEntity<?> getJobCountByRegion() {
        try {
            Map<String, Integer> result = jobService.getJobCountByRegion();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "지역별 채용공고 개수 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * 내가 작성한 채용공고 목록
     * GET /api/jobs/my?page=0&size=20
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session
    ) {
        try {
            Long companyNum = (Long) session.getAttribute("companyNum");
            
            if (companyNum == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "기업 로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Map<String, Object> result = jobService.getMyJobs(companyNum, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "내 채용공고 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * JSON 배열 문자열을 List로 파싱
     * @param jsonArray JSON 배열 문자열 (예: "[\"서울\", \"부산\"]")
     * @return List<String>
     */
    private java.util.List<String> parseJsonArray(String jsonArray) {
        if (jsonArray == null || jsonArray.trim().isEmpty()) {
            return null;
        }
        
        try {
            // 간단한 JSON 배열 파싱 (Jackson 사용 시 ObjectMapper 활용 가능)
            jsonArray = jsonArray.trim();
            if (jsonArray.startsWith("[") && jsonArray.endsWith("]")) {
                jsonArray = jsonArray.substring(1, jsonArray.length() - 1);
                String[] items = jsonArray.split(",");
                java.util.List<String> result = new java.util.ArrayList<>();
                for (String item : items) {
                    item = item.trim();
                    if (item.startsWith("\"") && item.endsWith("\"")) {
                        item = item.substring(1, item.length() - 1);
                    }
                    result.add(item);
                }
                return result;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return null;
    }
}