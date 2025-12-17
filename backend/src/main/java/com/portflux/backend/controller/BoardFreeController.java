package com.portflux.backend.controller;

import com.portflux.backend.beans.BoardFreeBean;
import com.portflux.backend.service.BoardFreeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class BoardFreeController {

    @Autowired
    private BoardFreeService boardFreeService;

    // 게시글 목록 조회
    @GetMapping("/list")
    public ResponseEntity<List<BoardFreeBean>> getBoardList() {
        List<BoardFreeBean> list = boardFreeService.getBoardList();
        return ResponseEntity.ok(list);
    }

    // 게시글 작성
    @PostMapping("/write")
    public ResponseEntity<String> writeBoard(@RequestBody BoardFreeBean boardFree) {
        try {
            if (boardFree.getBoardType() == null || boardFree.getBoardType().isEmpty()) {
                boardFree.setBoardType("free");
            }
            
            boardFreeService.writeBoard(boardFree);
            return ResponseEntity.ok("게시글이 등록되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("게시글 등록 실패: " + e.getMessage());
        }
    }
    
    // 게시글 상세 조회
    @GetMapping("/{postId}")
    public ResponseEntity<BoardFreeBean> getBoardDetail(@PathVariable("postId") int postId) {
        BoardFreeBean board = boardFreeService.getBoardDetail(postId);
        if (board != null) {
            return ResponseEntity.ok(board);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 게시글 수정
    @PutMapping("/update")
    public ResponseEntity<String> updateBoard(@RequestBody BoardFreeBean boardFree) {
         try {
            boardFreeService.updateBoard(boardFree);
            return ResponseEntity.ok("게시글이 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("게시글 수정 실패");
        }
    }
    
    // 게시글 삭제
    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deleteBoard(@PathVariable("postId") int postId) {
         try {
            boardFreeService.deleteBoard(postId);
            return ResponseEntity.ok("게시글이 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("게시글 삭제 실패");
        }
    }
}