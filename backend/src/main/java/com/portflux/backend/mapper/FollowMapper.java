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
    
    // 팔로우 추가
    @SelectKey(statement = "SELECT FOLLOWS_SEQ.NEXTVAL FROM dual",
            keyProperty = "followId",
            before = true,
            resultType = Long.class)
    @Insert("INSERT INTO FOLLOWS (followId, followerId, followingId, createdAt) " +
            "VALUES (#{followId}, #{followerId}, #{followingId}, SYSDATE)")
    void insertFollow(FollowBean followBean);

    // 팔로우 삭제
    @Delete("DELETE FROM FOLLOWS WHERE followerId = #{followerId} AND followingId = #{followingId}")
    void deleteFollow(FollowBean followBean);

    // 팔로우 존재 여부 확인
    @Select("SELECT COUNT(*) FROM FOLLOWS WHERE followerId = #{followerId} AND followingId = #{followingId}")
    int existsFollow(FollowBean followBean);

    // 특정 사용자가 팔로우하는 사용자 ID 목록 조회
    @Select("SELECT following_id FROM Follows WHERE followerId = #{followerId}")
    List<Long> selectFollowingIds(Long followerId);

    // 특정 사용자를 팔로우하는 사용자 ID 목록 조회
    @Select("SELECT follower_id FROM Follows WHERE followingId = #{followingId}")
    List<Long> selectFollowerIds(Long followingId);
}

