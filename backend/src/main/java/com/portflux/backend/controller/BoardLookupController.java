package com.portflux.backend.controller;

import com.portflux.backend.beans.BoardLookupPostDto;
import com.portflux.backend.beans.CommentDto;
import com.portflux.backend.service.BoardLookupService;
import com.portflux.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/boardlookup")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BoardLookupController {

    private final BoardLookupService boardLookupService;
    private final CommentService commentService;

    // 파일 업로드 경로 (application.properties에서 설정)
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    public BoardLookupController(BoardLookupService boardLookupService, CommentService commentService) {
        this.boardLookupService = boardLookupService;
        this.commentService = commentService;
    }

    /**
     * 게시글 상세 조회 API
     */
    @GetMapping("/{postId}")
    public ResponseEntity<Map<String, Object>> getPostDetail(@PathVariable int postId) {
        try {
            BoardLookupPostDto post = boardLookupService.getPostById(postId);
            
            if (post == null) {
                return ResponseEntity.notFound().build();
            }

            List<CommentDto> comments = commentService.getCommentsByPostId(postId);

            Map<String, Object> response = new HashMap<>();
            response.put("post", post);
            response.put("comments", comments);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 댓글 작성 API
     */
    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable int postId,
            @RequestBody Map<String, String> request
    ) {
        try {
            int userNum = Integer.parseInt(request.get("userNum"));
            String content = request.get("content");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 전체 게시글 목록 조회 API
     */
    @GetMapping("/posts")
    public ResponseEntity<List<BoardLookupPostDto>> getAllPosts() {
        try {
            List<BoardLookupPostDto> posts = boardLookupService.getAllLookupPosts();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 게시글 작성 API (파일 업로드 포함)
     * @ModelAttribute를 사용하여 DTO 필드명과 FormData의 key를 매핑합니다.
     */
    @PostMapping("/posts")
public ResponseEntity<Map<String, Object>> createPost(
        @ModelAttribute BoardLookupPostDto postDto,
        @RequestParam(value = "file", required = false) MultipartFile file
) {
    try {
        // 1. 파일 저장 로직
        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file);
            postDto.setPostFile(fileName);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "파일이 없습니다."));
        }

        // 2. 초기값 설정
        postDto.setAiSummary("AI 요약 대기 중...");
        postDto.setDownloadCnt(0);
        postDto.setViewCnt(0);

        // 3. DB 저장
        // insertPost가 실행되면 selectKey에 의해 postDto의 postId가 채워집니다.
        boardLookupService.createPost(postDto);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("postId", postDto.getPostId()); // 저장된 ID 반환
        response.put("message", "게시글이 등록되었습니다.");

        return ResponseEntity.ok(response);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    }
}

    /**
     * 파일 저장 메서드
     */
    private String saveFile(MultipartFile file) throws IOException {
        File uploadDirectory = new File(uploadDir);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        Path filePath = Paths.get(uploadDir, uniqueFilename);
        Files.write(filePath, file.getBytes());

        return uniqueFilename;
    }
}