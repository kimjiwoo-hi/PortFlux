package com.portflux.backend.controller;

import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.portflux.backend.beans.BoardFreeBean;
import com.portflux.backend.beans.BoardCommentBean;
import com.portflux.backend.service.BoardFreeService;

@RestController
@RequestMapping("/api/board/free")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" }, allowCredentials = "true")
public class BoardFreeController {

    @Autowired
    private BoardFreeService boardFreeService;

    private String getUploadPath() {
        return System.getProperty("user.dir") + "/files/";
    }

    @GetMapping("/list")
    public List<BoardFreeBean> list(@RequestParam(value = "keyword", required = false, defaultValue = "") String keyword) {
        return boardFreeService.getBoardList(keyword);
    }

    @GetMapping("/detail/{no}")
    public BoardFreeBean detail(@PathVariable int no) {
        return boardFreeService.getBoardDetail(no);
    }

    @PostMapping(value = "/write", consumes = "multipart/form-data")
    public ResponseEntity<String> insert(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("userId") String userId,
            @RequestParam("boardType") String boardType,
            @RequestParam(value = "role", required = false, defaultValue = "USER") String role,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            BoardFreeBean bean = new BoardFreeBean();
            bean.setTitle(title);
            bean.setContent(content);
            bean.setBoardType(boardType); // 프론트에서 넘어온 'notice' 또는 'free' 저장

            if (userId == null || userId.isEmpty() || userId.equals("null")) {
                return ResponseEntity.badRequest().body("로그인 정보가 없습니다.");
            }

            // [핵심 해결] 관리자(ADMIN)라 할지라도 게시글의 작성자 연결을 위해 userNum은 반드시 채워야 합니다.
            // USERS 테이블과 JOIN하여 닉네임을 가져와야 하기 때문입니다.
            bean.setUserNum(Integer.parseInt(userId));

            boardFreeService.writeBoard(bean, file, image);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail: " + e.getMessage());
        }
    }

    @PutMapping(value = "/update", consumes = "multipart/form-data")
    public ResponseEntity<String> update(
            @RequestParam("postId") int postId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            BoardFreeBean bean = boardFreeService.getBoardDetail(postId);
            if (bean == null) return ResponseEntity.notFound().build();

            bean.setTitle(title);
            bean.setContent(content);

            boardFreeService.updateBoard(bean, file, image);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail");
        }
    }

    @DeleteMapping("/delete/{no}")
    public String delete(@PathVariable int no) {
        boardFreeService.deleteBoard(no);
        return "success";
    }

    @PostMapping("/like/{id}")
    public ResponseEntity<String> toggleLike(@PathVariable int id, @RequestBody Map<String, Object> body) {
        try {
            Object userIdObj = body.get("userId");
            if (userIdObj == null) return ResponseEntity.badRequest().body("User ID missing");
            boolean liked = boardFreeService.toggleLike(id, String.valueOf(userIdObj));
            return ResponseEntity.ok(liked ? "LIKED" : "UNLIKED");
        } catch (Exception e) { return ResponseEntity.badRequest().body("Error"); }
    }

    @GetMapping("/comments/{postId}")
    public List<BoardCommentBean> getComments(@PathVariable int postId) {
        return boardFreeService.getCommentList(postId);
    }

    @PostMapping("/comment/write")
    public ResponseEntity<String> writeComment(@RequestBody BoardCommentBean commentBean) {
        try {
            boardFreeService.writeComment(commentBean);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail");
        }
    }

    @DeleteMapping("/comment/delete/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable int commentId) {
        try {
            boardFreeService.deleteComment(commentId);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail");
        }
    }

    @GetMapping("/image/{filename}")
    public ResponseEntity<Resource> showImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(getUploadPath()).resolve(filename).normalize();
            Resource resource = new FileSystemResource(filePath.toFile());
            if (!resource.exists()) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

            HttpHeaders header = new HttpHeaders();
            header.add("Content-Type", Files.probeContentType(filePath));
            return new ResponseEntity<>(resource, header, HttpStatus.OK);
        } catch (Exception e) { return new ResponseEntity<>(HttpStatus.NOT_FOUND); }
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> download(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(getUploadPath()).resolve(filename).normalize();
            Resource resource = new FileSystemResource(filePath.toFile());
            if (!resource.exists()) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

            String originalFileName = filename.substring(filename.indexOf("_") + 1);
            String encodedFileName = URLEncoder.encode(originalFileName, "UTF-8").replaceAll("\\+", "%20");
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                    .body(resource);
        } catch (Exception e) { return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); }
    }

    @PutMapping("/comment/update")
    public ResponseEntity<String> updateComment(@RequestBody BoardCommentBean commentBean) {
        try {
            boardFreeService.updateComment(commentBean);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail");
        }
    }
}