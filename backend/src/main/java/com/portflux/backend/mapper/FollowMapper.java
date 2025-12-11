package com.portflux.backend.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.SelectKey;

import com.portflux.backend.beans.FollowBean;

@Mapper
public interface FollowMapper {
    
    //팔로워 추가
    @SelectKey(statement = "SELECT FOLLOWS_SEQ.NEXTVAL FROM dual",
               keyProperty = "follow_id",
               before = true,
               resultType = Long.class)
    @Insert("INSERT INTO FOLLOWS (follow_id, follower_id, following_id, created_at) " +
            "VALUES (#{follow_id}, #{follower_id}, #{following_id}, SYSDATE)")
            void insertFollow(FollowBean followBean);

    //팔로워 삭제
    @Delete("DELETE FROM FOLLOWS WHERE follower_id = #{followerId} AND following_id = #{followingId}")
    void deleteFollow(FollowBean followBean);

    //팔로우 존재 여부 확인
    @Select("SELECT COUNT(*) FROM FOLLOWS WHERE follower_id = #{followerId} AND following_id = #{followingId}")
    int existsFollow(FollowBean followBean);

    //팔로워 수 조회
    @Select("Select following_id From Follows where follower_id = #{followerId}")
    List<Long> selectFollowingIds(Long followerId);

    //팔로잉 수 조회
    @Select("Select follower_id From Follows where following_id = #{followingId}")
    List<Long> selectFollowerIds(Long followingId);
}
