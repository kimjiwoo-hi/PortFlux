package com.portflux.backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PostSaveMapper {
    
    /**
     * 게시글 저장 추가
     */
    void insertPostSave(@Param("userNum") Long userNum, @Param("postId") int postId);
    
    /**
     * 게시글 저장 삭제
     */
    void deletePostSave(@Param("userNum") Long userNum, @Param("postId") int postId);
    
    /**
     * 저장 여부 확인
     */
    boolean isSaved(@Param("userNum") Long userNum, @Param("postId") int postId);
    
    /**
     * 특정 사용자의 저장된 게시글 목록 조회
     */
    java.util.List<Integer> findSavedPostIdsByUserNum(@Param("userNum") int userNum);
}