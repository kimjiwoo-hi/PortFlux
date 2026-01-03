package com.portflux.backend.controller;

import com.portflux.backend.dto.BoardLookupPostDto;
import com.portflux.backend.dto.CommentDto;
import com.portflux.backend.service.BoardLookupService;
import com.portflux.backend.service.LikeService;
import com.portflux.backend.service.CommentService;
import com.portflux.backend.service.FileImageService;  // ⭐ 하나만!
import com.portflux.backend.service.PostSaveService;
import com.portflux.backend.mapper.PostSaveMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

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
    private final FileImageService fileImageService;  // ⭐ 하나만!
    private final LikeService likeService;
    private final PostSaveService postSaveService;
    private final PostSaveMapper postSaveMapper;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    public BoardLookupController(
            BoardLookupService boardLookupService,
            CommentService commentService,
            FileImageService fileImageService,  // ⭐ 하나만!
            LikeService likeService,
            PostSaveService postSaveService,
            PostSaveMapper postSaveMapper
    ) {
        this.boardLookupService = boardLookupService;
        this.commentService = commentService;
        this.fileImageService = fileImageService;  // ⭐ 하나만!
        this.likeService = likeService;
        this.postSaveService = postSaveService;
        this.postSaveMapper = postSaveMapper;
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
            CommentDto newComment = commentService.addComment(postId, userNum, content);
            return ResponseEntity.ok(newComment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 댓글 삭제 API
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(
            @PathVariable int commentId,
            @RequestParam Long userNum
    ) {
        try {
            commentService.deleteComment(commentId, userNum);
            return ResponseEntity.ok(Map.of("success", true, "message", "댓글이 삭제되었습니다."));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalAccessException e) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "알 수 없는 오류가 발생했습니다."));
        }
    }

    /**
     * 전체 게시글 목록 조회 API
     */
    @GetMapping("/posts")
    public ResponseEntity<List<BoardLookupPostDto>> getAllPosts() {
        try {
            List<BoardLookupPostDto> posts = boardLookupService.getAllLookupPosts();

            // 각 게시글에 PDF 이미지 목록 및 좋아요 수 추가
            for (BoardLookupPostDto post : posts) {
                // PDF 이미지 추가
                Path imageDir = Paths.get(uploadDir, "pdf", "post_" + post.getPostId());
                if (Files.exists(imageDir)) {
                    List<String> images = Files.list(imageDir)
                            .filter(p -> p.toString().endsWith(".jpg"))
                            .sorted()
                            .map(p -> "/uploads/pdf/post_" + post.getPostId() + "/" + p.getFileName())
                            .toList();
                    post.setPdfImages(images);
                }
                
                // 좋아요 수 추가
                int likeCount = likeService.getLikeCount(post.getPostId());
                post.setLikeCnt(likeCount);
            }

            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 게시글 작성 API (파일 업로드 포함)
     */
    @PostMapping("/posts")
    public ResponseEntity<Map<String, Object>> createPost(
            @ModelAttribute BoardLookupPostDto postDto,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("userNum") int userNum
    ) {
        try {
            postDto.setUserNum(userNum);

            String fileName = null;
        // 1. 파일 유효성 검사 및 저장
        if (file != null && !file.isEmpty()) {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !isValidFileExtension(originalFilename)) {
                return ResponseEntity.badRequest().body(
                        Map.of("success", false, "message", "허용되지 않는 파일 형식입니다.")
                );
            }
            fileName = saveFile(file);  // ✅ 파일명 저장
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

            System.out.println("=== 파일 변환 시작 ===");
            System.out.println("PostId: " + postDto.getPostId());
            System.out.println("File: " + file.getOriginalFilename());

            // 4. ✅ 저장된 파일을 사용하여 이미지 변환
        File uploadDirFile = new File(uploadDir);
        uploadDirFile = uploadDirFile.getAbsoluteFile();
        File savedFile = new File(uploadDirFile, fileName);
        
        List<String> fileImages = fileImageService.convertSavedFileToImages(savedFile, postDto.getPostId());
        postDto.setPdfImages(fileImages);

        System.out.println("=== 파일 변환 완료 ===");
        System.out.println("이미지 개수: " + fileImages.size());

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
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            postDto.setPostId(postId);

            if (file != null && !file.isEmpty()) {
                String fileName = saveFile(file);
                postDto.setPostFile(fileName);
            }

            if (postDto.getUserNum() == null) {
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "User number is required."));
            }

            BoardLookupPostDto updatedPost = boardLookupService.updatePost(postDto, postDto.getUserNum().longValue());
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
     * 좋아요 토글 API
     */
    @PostMapping("/{postId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable int postId,
            @RequestParam int userNum
    ) {
        try {
            Map<String, Object> result = likeService.toggleLike(userNum, postId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "isLiked", result.get("isLiked"),
                "totalLikes", result.get("totalLikes")
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    /**
     * 좋아요 상태 확인 API
     */
    @GetMapping("/{postId}/like/check")
    public ResponseEntity<Map<String, Object>> checkLikeStatus(
            @PathVariable int postId,
            @RequestParam int userNum
    ) {
        try {
            boolean isLiked = likeService.isLiked(userNum, postId);
            int totalLikes = likeService.getLikeCount(postId);

            return ResponseEntity.ok(Map.of(
                "isLiked", isLiked,
                "totalLikes", totalLikes
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    /**
     * 특정 사용자의 게시글 목록 조회 API
     */
    @GetMapping("/user/{userNum}/posts")
    public ResponseEntity<List<BoardLookupPostDto>> getPostsByUser(@PathVariable int userNum) {
        try {
            List<BoardLookupPostDto> posts = boardLookupService.getPostsByUserNum(userNum);

            for (BoardLookupPostDto post : posts) {
                Path imageDir = Paths.get(uploadDir, "pdf", "post_" + post.getPostId());
                if (Files.exists(imageDir)) {
                    List<String> images = Files.list(imageDir)
                            .filter(p -> p.toString().endsWith(".jpg"))
                            .sorted()
                            .map(p -> "/uploads/pdf/post_" + post.getPostId() + "/" + p.getFileName())
                            .toList();
                    post.setPdfImages(images);
                }
                
                int likeCount = likeService.getLikeCount(post.getPostId());
                post.setLikeCnt(likeCount);
            }

            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 사용자의 댓글 목록 조회 API
     */
    @GetMapping("/user/{userNum}/comments")
    public ResponseEntity<List<CommentDto>> getCommentsByUser(@PathVariable int userNum) {
        try {
            List<CommentDto> comments = commentService.getCommentsByUserNum(userNum);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 닉네임으로 사용자의 게시글 목록 조회 API
     */
    @GetMapping("/user/nickname/{nickname}/posts")
    public ResponseEntity<List<BoardLookupPostDto>> getPostsByNickname(@PathVariable String nickname) {
        try {
            List<BoardLookupPostDto> posts = boardLookupService.getPostsByNickname(nickname);

            for (BoardLookupPostDto post : posts) {
                Path imageDir = Paths.get(uploadDir, "pdf", "post_" + post.getPostId());
                if (Files.exists(imageDir)) {
                    List<String> images = Files.list(imageDir)
                            .filter(p -> p.toString().endsWith(".jpg"))
                            .sorted()
                            .map(p -> "/uploads/pdf/post_" + post.getPostId() + "/" + p.getFileName())
                            .toList();
                    post.setPdfImages(images);
                }
                
                int likeCount = likeService.getLikeCount(post.getPostId());
                post.setLikeCnt(likeCount);
            }

            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 닉네임으로 사용자의 댓글 목록 조회 API
     */
    @GetMapping("/user/nickname/{nickname}/comments")
    public ResponseEntity<List<CommentDto>> getCommentsByNickname(@PathVariable String nickname) {
        try {
            List<CommentDto> comments = commentService.getCommentsByNickname(nickname);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자가 해당 게시물을 구매했는지 확인
     */
    @GetMapping("/{postId}/purchased")
    public ResponseEntity<Map<String, Boolean>> checkPurchaseStatus(
            @PathVariable int postId,
            @RequestParam Long userNum
    ) {
        try {
            System.out.println("=== 구매 상태 확인 요청 ===");
            System.out.println("postId: " + postId);
            System.out.println("userNum: " + userNum);
            
            boolean isPurchased = boardLookupService.isPurchased(userNum, postId);
            
            System.out.println("구매 여부: " + isPurchased);
            System.out.println("========================");
            
            return ResponseEntity.ok(Map.of("isPurchased", isPurchased));
        } catch (Exception e) {
            System.err.println("구매 상태 확인 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("isPurchased", false));
        }
    }

    /**
     * 파일 다운로드 API (PDF/PPT)
     */
    @GetMapping("/{postId}/download")
    public ResponseEntity<?> downloadPdf(
            @PathVariable int postId,
            @RequestParam Long userNum
    ) {
        try {
            // 구매 확인
            if (!boardLookupService.isPurchased(userNum, postId)) {
                return ResponseEntity.status(403).body(Map.of("message", "구매하지 않은 게시물입니다."));
            }

            BoardLookupPostDto post = boardLookupService.getPostById(postId);
            if (post == null || post.getPostFile() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(uploadDir, post.getPostFile());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            
            // 다운로드 카운트 증가
            boardLookupService.incrementDownloadCount(postId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + post.getPostFile() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 게시글 저장 토글 API
     */
    @PostMapping("/{postId}/save")
    public ResponseEntity<Map<String, Object>> toggleSave(
            @PathVariable int postId,
            @RequestParam Long userNum
    ) {
        try {
            Map<String, Object> result = postSaveService.toggleSave(userNum, postId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "isSaved", result.get("isSaved")
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "message", e.getMessage())
            );
        }
    }

/**
 * 저장 상태 확인 API
 */
@GetMapping("/{postId}/save/check")
public ResponseEntity<Map<String, Object>> checkSaveStatus(
        @PathVariable int postId,
        @RequestParam Long userNum
) {
    try {
        boolean isSaved = postSaveService.isSaved(userNum, postId);
        return ResponseEntity.ok(Map.of("isSaved", isSaved));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body(
            Map.of("success", false, "message", e.getMessage())
        );
    }
}
/**
 * 사용자의 저장된 게시글 ID 목록 조회
 */
@GetMapping("/user/{userNum}/saved")
public ResponseEntity<List<Integer>> getSavedPostIds(@PathVariable int userNum) {
    try {
        List<Integer> savedPostIds = postSaveMapper.findSavedPostIdsByUserNum(userNum);
        return ResponseEntity.ok(savedPostIds);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().build();
    }
}

    /**
     * 파일 확장자 검증
     */
    private boolean isValidFileExtension(String filename) {
        String lowerCaseFilename = filename.toLowerCase();
        return lowerCaseFilename.endsWith(".pdf")
            || lowerCaseFilename.endsWith(".ppt")
            || lowerCaseFilename.endsWith(".pptx");
    }

    /**
     * 파일 저장
     */
    private String saveFile(MultipartFile file) throws IOException {
    if (file == null || file.isEmpty()) {
        throw new IOException("파일이 비어있습니다.");
    }

    String originalFilename = file.getOriginalFilename();
    String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
    String savedFilename = UUID.randomUUID().toString() + extension;

    // ✅ File 객체로 생성하면 자동으로 절대 경로로 변환됨
    File uploadDirFile = new File(uploadDir);
    uploadDirFile = uploadDirFile.getAbsoluteFile();
    
    // ✅ 디렉토리가 없으면 생성
    if (!uploadDirFile.exists()) {
        uploadDirFile.mkdirs();
        System.out.println("✅ 업로드 디렉토리 생성: " + uploadDirFile.getAbsolutePath());
    }

    // ✅ 파일 저장
    File destinationFile = new File(uploadDirFile, savedFilename);
    file.transferTo(destinationFile);
    
    System.out.println("✅ 파일 저장 완료: " + destinationFile.getAbsolutePath());

    return savedFilename;
}
}