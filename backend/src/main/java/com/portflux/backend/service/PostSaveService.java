package com.portflux.backend.service;

import com.portflux.backend.mapper.PostSaveMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostSaveService {

    private final PostSaveMapper postSaveMapper;

    /**
     * 저장 토글 (저장/저장 취소)
     */
    @Transactional
    public Map<String, Object> toggleSave(Long userNum, int postId) {
        boolean isSaved = postSaveMapper.isSaved(userNum, postId);
        
        if (isSaved) {
            postSaveMapper.deletePostSave(userNum, postId);
        } else {
            try {
                postSaveMapper.insertPostSave(userNum, postId);
            } catch (Exception e) {
                // 중복 저장 시도 시 무시
                if (!e.getMessage().contains("unique constraint")) {
                    throw e;
                }
            }
        }
        
        boolean newSavedStatus = !isSaved;
        
        Map<String, Object> result = new HashMap<>();
        result.put("isSaved", newSavedStatus);
        return result;
    }

    /**
     * 저장 여부 확인
     */
    public boolean isSaved(Long userNum, int postId) {
        return postSaveMapper.isSaved(userNum, postId);
    }
}