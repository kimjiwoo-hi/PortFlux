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

    // 게시글 목록 조회
    public List<BoardFreeBean> getBoardList(String keyword) {
        return boardFreeMapper.getBoardList(keyword);
    }

    /**
     * 1. 게시글 작성
     * 역할(role)에 따라 ID를 적절한 컬럼으로 배분합니다.
     */
    @Transactional
    public void writeBoard(BoardFreeBean boardFreeBean, MultipartFile file, MultipartFile image, String role) throws IOException {
        if (file != null && !file.isEmpty()) {
            boardFreeBean.setPostFile(saveFile(file));
        }
        if (image != null && !image.isEmpty()) {
            boardFreeBean.setImage(saveFile(image));
        }

        if ("COMPANY".equals(role)) {
            boardFreeBean.setCompanyNum(boardFreeBean.getUserNum());
            boardFreeBean.setUserNum(null); 
        } else {
            boardFreeBean.setCompanyNum(null);
        }

        boardFreeMapper.insertBoard(boardFreeBean);
    }

    // 게시글 상세 조회
    public BoardFreeBean getBoardDetail(int postId) {
        boardFreeMapper.increaseViewCount(postId);
        return boardFreeMapper.getBoardDetail(postId);
    }

    // 게시글 수정
    @Transactional
    public void updateBoard(BoardFreeBean boardFreeBean, MultipartFile file, MultipartFile image, boolean keepFile, boolean keepImage) throws IOException {
        // 새 파일이 업로드된 경우
        if (file != null && !file.isEmpty()) {
            boardFreeBean.setPostFile(saveFile(file));
        } else if (!keepFile) {
            // 기존 파일 유지하지 않음 (삭제)
            boardFreeBean.setPostFile(null);
        }
        // else: 기존 파일 유지 (bean에 이미 기존 값이 있음)

        // 새 이미지가 업로드된 경우
        if (image != null && !image.isEmpty()) {
            boardFreeBean.setImage(saveFile(image));
        } else if (!keepImage) {
            // 기존 이미지 유지하지 않음 (삭제)
            boardFreeBean.setImage(null);
        }
        // else: 기존 이미지 유지 (bean에 이미 기존 값이 있음)

        boardFreeMapper.updateBoard(boardFreeBean);
    }

    // 게시글 삭제
    public void deleteBoard(int postId) {
        boardFreeMapper.deleteBoard(postId);
    }

    /**
     * 2. 좋아요(추천) 토글
     * [NPE 해결] 파라미터를 Integer 객체로 처리하여 null 안전성을 확보했습니다.
     */
    @Transactional
    public boolean toggleLike(int postId, String userId, String role) {
        if (userId == null || "null".equals(userId) || userId.isEmpty()) {
            return false;
        }

        Integer userNum = null;
        Integer companyNum = null;
        int idVal = Integer.parseInt(userId);

        if ("COMPANY".equals(role)) {
            companyNum = idVal;
        } else {
            userNum = idVal;
        }

        // Mapper의 파라미터가 Integer이므로 null을 안전하게 전달합니다.
        int count = boardFreeMapper.checkLike(postId, userNum, companyNum, role);
        
        if (count > 0) {
            boardFreeMapper.deleteLike(postId, userNum, companyNum, role);
            boardFreeMapper.decreaseLikeCount(postId);
            return false;
        } else {
            boardFreeMapper.insertLike(postId, userNum, companyNum, role);
            boardFreeMapper.increaseLikeCount(postId);
            return true;
        }
    }

    // 댓글 목록 조회
    public List<BoardCommentBean> getCommentList(int postId) {
        return boardFreeMapper.getCommentList(postId);
    }

    /**
     * 3. 댓글 작성
     */
    @Transactional
    public void writeComment(BoardCommentBean commentBean) {
        if ("COMPANY".equals(commentBean.getRole())) {
            commentBean.setCompanyNum(commentBean.getUserNum());
            commentBean.setUserNum(null);
        } else {
            commentBean.setCompanyNum(null);
        }
        boardFreeMapper.insertComment(commentBean);
    }

    public void deleteComment(int commentId) {
        boardFreeMapper.deleteComment(commentId);
    }

    public void updateComment(BoardCommentBean commentBean) {
        boardFreeMapper.updateComment(commentBean);
    }

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