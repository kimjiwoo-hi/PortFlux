package com.portflux.backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FollowMapper {
    
    //팔로워 추가
    int insertFollow(@Param("followerId") Long followerId,
                     @Param("followeeId") Long followeeId);

    //팔로워 삭제
    int deleteFollow(@Param("followerId") Long followerId,
                     @Param("followeeId") Long followeeId);
    
    //팔로우 존재 여부 확인
    int existsFollow(@Param("followerId") Long followerId,
                     @Param("followeeId") Long followeeId);
    //팔로워 수 조회
    int countFollowers(@Param("userId") Long userId);

    //팔로잉 수 조회
    int countFollowing(@Param("userId") Long userId);

}
