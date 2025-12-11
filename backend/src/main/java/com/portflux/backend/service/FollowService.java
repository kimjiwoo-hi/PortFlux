package com.portflux.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.portflux.backend.beans.FollowBean;
import com.portflux.backend.mapper.FollowMapper;

@Service
public class FollowService {
    
    @Autowired
    private FollowMapper followMapper;

    // 팔로우 추가
    public void followUser(Long me, Long target) {
        FollowBean followBean = new FollowBean();
        followBean.setFollowerId(me);
        followBean.setFollowingId(target);

        if(followMapper.existsFollow(followBean) == 0) {
            followMapper.insertFollow(followBean);
        }
        }

    // 팔로우 취소
    public void unFollowUser(Long me, Long target) {
        FollowBean followBean = new FollowBean();
        followBean.setFollowerId(me);
        followBean.setFollowingId(target);

        followMapper.deleteFollow(followBean);
    }

    // 팔로윙 확인
    public List<Long> isFollowingList(Long me){
        return followMapper.selectFollowingIds(me);
    }

    // 팔로워 
    public List<Long> isFollowerList(Long me){
        return followMapper.selectFollowerIds(me);
    }


}
