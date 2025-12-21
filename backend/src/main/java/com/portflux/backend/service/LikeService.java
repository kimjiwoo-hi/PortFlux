package com.portflux.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class LikeService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 좋아요 토글 (누르면 추가, 다시 누르면 취소)
     * @param userNum 사용자 번호
     * @param postId 게시글 ID
     * @return Map { "isLiked": boolean, "totalLikes": int }
     */
    @Transactional
    public Map<String, Object> toggleLike(int userNum, int postId) {
        // 1. 이미 좋아요 눌렀는지 확인
        String checkSql = "SELECT COUNT(*) FROM POST_LIKE WHERE user_num = ? AND post_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userNum, postId);
        
        boolean isLiked;
        
        if (count != null && count > 0) {
            // 이미 좋아요 누름 → 취소
            String deleteSql = "DELETE FROM POST_LIKE WHERE user_num = ? AND post_id = ?";
            jdbcTemplate.update(deleteSql, userNum, postId);
            isLiked = false;
        } else {
            // 좋아요 추가
            try {
                String insertSql = "INSERT INTO POST_LIKE (user_num, post_id) VALUES (?, ?)";
                jdbcTemplate.update(insertSql, userNum, postId);
                isLiked = true;
            } catch (DuplicateKeyException e) {
                // 동시성 문제로 이미 추가됨 → 좋아요 상태 유지
                isLiked = true;
            }
        }
        
        // 2. 전체 좋아요 개수 조회
        String countSql = "SELECT COUNT(*) FROM POST_LIKE WHERE post_id = ?";
        Integer totalLikes = jdbcTemplate.queryForObject(countSql, Integer.class, postId);
        
        return Map.of(
            "isLiked", isLiked,
            "totalLikes", totalLikes != null ? totalLikes : 0
        );
    }

    /**
     * 특정 사용자가 특정 게시글에 좋아요를 눌렀는지 확인
     * @param userNum 사용자 번호
     * @param postId 게시글 ID
     * @return 좋아요 여부
     */
    public boolean isLiked(int userNum, int postId) {
        String sql = "SELECT COUNT(*) FROM POST_LIKE WHERE user_num = ? AND post_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userNum, postId);
        return count != null && count > 0;
    }

    /**
     * 게시글의 총 좋아요 개수 조회
     * @param postId 게시글 ID
     * @return 좋아요 개수
     */
    public int getLikeCount(int postId) {
        String sql = "SELECT COUNT(*) FROM POST_LIKE WHERE post_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, postId);
        return count != null ? count : 0;
    }
}