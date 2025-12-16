package com.portflux.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.portflux.backend.beans.FollowBean;

// [팔로우 Repository]
//   - DB 접근만 담당
//   - 쿼리는 메서드 이름 기반(JPA Query Method)
 
@Repository
public interface FollowRepository extends JpaRepository<FollowBean, Long> {

    // 팔로우 여부 확인
    // @return true : 이미 팔로우 중
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    //언팔로우
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    //내가 팔로우한 사람 수 (팔로잉 수)
    long countByFollowerId(Long followerId);

    //나를 팔로우한 사람 수 (팔로워 수)
    long countByFollowingId(Long followingId);

    //내가 팔로우한 사람 목록
    List<FollowBean> findByFollowerIdOrderByCreatedAtDesc(Long followerId);

    
    //나를 팔로우한 사람 목록
    List<FollowBean> findByFollowingIdOrderByCreatedAtDesc(Long followingId);
}
