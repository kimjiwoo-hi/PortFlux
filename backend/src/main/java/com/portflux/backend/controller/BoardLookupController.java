package com.portflux.backend.controller;

import com.portflux.backend.beans.BoardLookupPostDto;
import com.portflux.backend.beans.CommentDto;
import com.portflux.backend.service.BoardLookupService;
import com.portflux.backend.service.LikeService;  // ✅ 수정: 별도 클래스로
import com.portflux.backend.service.CommentService;
import com.portflux.backend.service.PdfImageService;

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
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/boardlookup")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BoardLookupController {

    private final BoardLookupService boardLookupService;
    private final CommentService commentService;
    private final PdfImageService pdfImageService;
    private final LikeService likeService;  // ✅ 추가

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    public BoardLookupController(
            BoardLookupService boardLookupService,
            CommentService commentService,
            PdfImageService pdfImageService,
            LikeService likeService
    ) {
        this.boardLookupService = boardLookupService;
        this.commentService = commentService;
        this.pdfImageService = pdfImageService;
        this.likeService = likeService;
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

            // PDF 이미지 목록 세팅
            Path imageDir = Paths.get(uploadDir, "pdf", "post_" + postId);
            if (Files.exists(imageDir)) {
                List<String> images = Files.list(imageDir)
                        .filter(p -> p.toString().endsWith(".jpg"))
                        .sorted()
                        .map(p -> "/uploads/pdf/post_" + postId + "/" + p.getFileName())
                        .toList();

                post.setPdfImages(images);
            }

            List<CommentDto> comments = commentService.getCommentsByPostId(postId);

            Map<String, Object> response = new HashMap<>();
            response.put("post", post);
            response.put("comments", comments);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
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
            // TODO: 댓글 저장 로직
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
     */
    @PostMapping("/posts")
    public ResponseEntity<Map<String, Object>> createPost(
            @ModelAttribute BoardLookupPostDto postDto,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            // 1. 파일 유효성 검사 및 저장
            if (file != null && !file.isEmpty()) {
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null || !isValidFileExtension(originalFilename)) {
                    return ResponseEntity.badRequest().body(
                            Map.of("success", false, "message", "허용되지 않는 파일 형식입니다. PDF 파일만 업로드할 수 있습니다.")
                    );
                }
                String fileName = saveFile(file);
                postDto.setPostFile(fileName);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "파일이 없습니다."));
            }

            // 2. 초기값 설정
            postDto.setAiSummary("AI 요약 대기 중...");
            postDto.setDownloadCnt(0);
            postDto.setViewCnt(0);

            // 3. DB 저장 (postId 생성)
            boardLookupService.createPost(postDto);

            System.out.println("=== PDF 변환 시작 ===");
            System.out.println("PostId: " + postDto.getPostId());
            System.out.println("File: " + file.getOriginalFilename());

            // 4. PDF → 이미지 변환
            List<String> pdfImages = pdfImageService.convertPdfToImages(file, postDto.getPostId());
            postDto.setPdfImages(pdfImages);

            System.out.println("=== PDF 변환 완료 ===");
            System.out.println("이미지 개수: " + pdfImages.size());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("postId", postDto.getPostId());
            response.put("message", "게시글이 등록되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    /**
     * 게시글 수정 API
     */
    @PutMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> updatePost(
            @PathVariable int postId,
            @ModelAttribute BoardLookupPostDto postDto,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam Long userNum
    ) {
        try {
            postDto.setPostId(postId);

            if (file != null && !file.isEmpty()) {
                String fileName = saveFile(file);
                postDto.setPostFile(fileName);
            }

            BoardLookupPostDto updatedPost = boardLookupService.updatePost(postDto, userNum);
            return ResponseEntity.ok(Map.of("success", true, "post", updatedPost));

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalAccessException e) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 게시글 삭제 API
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @PathVariable int postId,
            @RequestParam Long userNum
    ) {
        try {
            boardLookupService.deletePost(postId, userNum);
            return ResponseEntity.ok(Map.of("success", true, "message", "게시글이 삭제되었습니다."));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalAccessException e) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 좋아요 API
     */
    @PostMapping("/{postId}/like")
    public ResponseEntity<Map<String, Object>> likePost(@PathVariable int postId) {
        try {
            int updatedLikeCnt = likeService.increaseLike(postId);
            return ResponseEntity.ok(Map.of("success", true, "likeCnt", updatedLikeCnt));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    /**
     * 장바구니 추가 API (TODO)
     */
    @PostMapping("/cart")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody Map<String, Integer> request) {
        try {
            // TODO: 장바구니 로직 구현
            return ResponseEntity.ok(Map.of("success", true, "message", "장바구니에 추가되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    // ======== Private Methods ========

    private boolean isValidFileExtension(String filename) {
        String lowerCaseFilename = filename.toLowerCase();
        return lowerCaseFilename.endsWith(".pdf");
    }

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

        String uniqueFilename = UUID.randomUUID() + extension;
        Path filePath = Paths.get(uploadDir, uniqueFilename);
        Files.write(filePath, file.getBytes());

        return uniqueFilename;
    }
}