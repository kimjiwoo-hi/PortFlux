package com.portflux.backend.service;

import com.portflux.backend.beans.BoardFreeBean;
import com.portflux.backend.beans.BoardCommentBean;
import com.portflux.backend.mapper.BoardFreeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class BoardFreeService {

    @Autowired
    private BoardFreeMapper boardFreeMapper;

    @Value("${file.upload-dir:files}")
    private String uploadDir;

    // 게시글 목록
    public List<BoardFreeBean> getBoardList(String keyword) {
        return boardFreeMapper.getBoardList(keyword);
    }

    // 게시글 작성 (관리자 여부 로직 포함)
    public void writeBoard(BoardFreeBean boardFreeBean, MultipartFile file, MultipartFile image) throws IOException {
        if (file != null && !file.isEmpty()) {
            boardFreeBean.setPostFile(saveFile(file));
        }
        if (image != null && !image.isEmpty()) {
            boardFreeBean.setImage(saveFile(image));
        }

        // [추가] 보안 로직: 공지사항인데 관리자 번호가 없다면 거부
        if ("notice".equals(boardFreeBean.getBoardType()) && boardFreeBean.getAdminNum() == null) {
            throw new RuntimeException("공지사항은 관리자만 작성할 수 있습니다.");
        }

        boardFreeMapper.insertBoard(boardFreeBean);
    }

    // 게시글 상세
    public BoardFreeBean getBoardDetail(int postId) {
        boardFreeMapper.increaseViewCount(postId);
        return boardFreeMapper.getBoardDetail(postId);
    }

    // 게시글 수정
    public void updateBoard(BoardFreeBean boardFreeBean, MultipartFile file, MultipartFile image) throws IOException {
        if (file != null && !file.isEmpty()) {
            boardFreeBean.setPostFile(saveFile(file));
        }
        if (image != null && !image.isEmpty()) {
            boardFreeBean.setImage(saveFile(image));
        }
        boardFreeMapper.updateBoard(boardFreeBean);
    }

    // 게시글 삭제
    public void deleteBoard(int postId) {
        boardFreeMapper.deleteBoard(postId);
    }

    // 좋아요 토글
    @Transactional
    public boolean toggleLike(int postId, String userId) {
        int userNum = 0;
        try {
            userNum = Integer.parseInt(userId);
        } catch (NumberFormatException e) {
            return false;
        }

        int count = boardFreeMapper.checkLike(postId, userNum);
        if (count > 0) {
            boardFreeMapper.deleteLike(postId, userNum);
            boardFreeMapper.decreaseLikeCount(postId);
            return false;
        } else {
            boardFreeMapper.insertLike(postId, userNum);
            boardFreeMapper.increaseLikeCount(postId);
            return true;
        }
    }

    // 댓글 목록
    public List<BoardCommentBean> getCommentList(int postId) {
        return boardFreeMapper.getCommentList(postId);
    }

    public void writeComment(BoardCommentBean commentBean) {
        boardFreeMapper.insertComment(commentBean);
    }

    public void deleteComment(int commentId) {
        boardFreeMapper.deleteComment(commentId);
    }

    public void updateComment(BoardCommentBean commentBean) {
        boardFreeMapper.updateComment(commentBean);
    }

    // 파일 저장 로직
    private String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        String projectPath = System.getProperty("user.dir");
        String uploadPath = projectPath + File.separator + "files";

        File directory = new File(uploadPath);
        if (!directory.exists()) directory.mkdirs();

        String savedFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        File dest = new File(directory, savedFileName);
        file.transferTo(dest);

        return savedFileName;
    }
}