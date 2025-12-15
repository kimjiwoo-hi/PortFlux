package com.portflux.backend.service;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portflux.backend.beans.FollowBean;
import com.portflux.backend.mapper.FollowMapper;

@Service
public class FollowService {

    @Autowired
    private FollowMapper followMapper;

    // 팔로우 추가
    @Transactional
    public void followUser(Long me, Long target) {
        if (Objects.equals(me, target)) {
            throw new IllegalArgumentException("자기 자신을 팔로우할 수 없습니다.");
        }

        FollowBean followBean = new FollowBean();
        followBean.setFollowerId(me);
        followBean.setFollowingId(target);

        if (followMapper.existsFollow(followBean) == 0) {
            followMapper.insertFollow(followBean);
        }
    }

    // 팔로우 취소
    @Transactional
    public void unFollowUser(Long me, Long target) {
        FollowBean followBean = new FollowBean();
        followBean.setFollowerId(me);
        followBean.setFollowingId(target);

        followMapper.deleteFollow(followBean);
    }

    // 팔로잉 목록 조회
    public List<Long> getFollowingList(Long me) {
        return followMapper.selectFollowingIds(me);
    }

    // 팔로워 목록 조회
    public List<Long> getFollowersList(Long me) {
        return followMapper.selectFollowerIds(me);
    }
}
