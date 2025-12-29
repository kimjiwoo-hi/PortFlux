
package com.portflux.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portflux.backend.beans.FollowBean;
import com.portflux.backend.repository.FollowRepository;

import lombok.RequiredArgsConstructor;

/**
 * [팔로우 서비스]
 * - 실제 비즈니스 규칙 처리
 * - 중복 팔로우 방지
 * - 자기 자신 팔로우 방지
 */
@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;

    //팔로우 처리
    @Transactional
    public void follow(Long followerId, Long followingId) {

        // 1. 기본 유효성 체크
        if (followerId == null || followingId == null) {
            throw new IllegalArgumentException("팔로우 정보가 올바르지 않습니다.");
        }

        // 2. 자기 자신 팔로우 방지
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("자기 자신은 팔로우할 수 없습니다.");
        }

        // 3. 이미 팔로우 중인지 확인
        boolean alreadyFollowing =
                followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);

        if (alreadyFollowing) {
            // 이미 팔로우 중이면 아무 처리도 하지 않음
            return;
        }

        // 4. 팔로우 정보 저장
        FollowBean follow = new FollowBean();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);

        followRepository.save(follow);
    }

    //언팔로우 처리
    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    //팔로우 여부 확인
    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    //팔로잉 수 조회
    @Transactional(readOnly = true)
    public long countFollowing(Long userNum) {
        return followRepository.countByFollowerId(userNum);
    }

    //팔로워 수 조회
    @Transactional(readOnly = true)
    public long countFollowers(Long userNum) {
        return followRepository.countByFollowingId(userNum);
    }

    //팔로잉 목록 조회
    @Transactional(readOnly = true)
    public List<FollowBean> getFollowingList(Long userNum) {
        return followRepository.findByFollowerIdOrderByCreatedAtDesc(userNum);
    }

    //팔로워 목록 조회
    @Transactional(readOnly = true)
    public List<FollowBean> getFollowerList(Long userNum) {
        return followRepository.findByFollowingIdOrderByCreatedAtDesc(userNum);
    }
}
