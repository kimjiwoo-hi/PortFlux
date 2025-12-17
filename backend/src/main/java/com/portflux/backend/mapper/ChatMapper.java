package com.portflux.backend.mapper;

import java.util.List;

import org.apache.ibatis.annotations.*;

import com.portflux.backend.beans.ChatBean;
import com.portflux.backend.beans.ChatMessageBean;

@Mapper
public interface ChatMapper {

    //채팅방 조회
    @Select("""
        SELECT 
            room_id       AS roomId,
            user1_num     AS user1Num,
            user2_num     AS user2Num,
            created_at    AS createdAt,
            last_message_at AS lastMessageAt,
            status        AS status
        FROM DIRECT_CHAT_ROOMS
        WHERE (user1_num = #{user1Num} AND user2_num = #{user2Num})
           OR (user1_num = #{user2Num} AND user2_num = #{user1Num})
    """)
    ChatBean findChatRoomByUserIds(@Param("user1Num") Long user1Num, @Param("user2Num") Long user2Num);

    //채팅방 생성
    @Insert("""
        INSERT INTO DIRECT_CHAT_ROOMS (user1_num, user2_num, created_at, last_message_at, status)
        VALUES (#{user1Num}, #{user2Num}, SYSDATE, SYSDATE, 'ACTIVE')
    """)
    @Options(useGeneratedKeys = true, keyProperty = "roomId", keyColumn = "room_id")
    void insertChatRoom(ChatMessageBean chatMessage);

    //유저가 있는 채팅방 목록
    @Select("""
        SELECT 
            room_id       AS roomId,
            user1_num     AS user1Num,
            user2_num     AS user2Num,
            created_at    AS createdAt,
            last_message_at AS lastMessageAt,
            status        AS status
        FROM DIRECT_CHAT_ROOMS
        WHERE user1_num = #{userNum} OR user2_num = #{userNum}
        ORDER BY last_message_at DESC NULLS LAST
    """)
    List<ChatBean> findChatRoomsByUserNum(@Param("userNum") Long userNum);

    //메세지 저장
    @Insert("""
        INSERT INTO CHAT_MESSAGES
            (room_id, user_num, sender_num, content, has_file, sent_at, read_yn, deleted_yn)
        VALUES
            (#{roomId}, #{userNum}, #{senderNum}, #{content}, #{hasFile}, SYSDATE, #{readYn}, #{deletedYn})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "messageId", keyColumn = "message_id")
    void insertChatMessage(ChatBean chatRoom);

    //메세지 목록
    @Select("""
        SELECT
            message_id   AS messageId,
            room_id      AS roomId,
            user_num     AS userNum,
            sender_num   AS senderNum,
            content      AS content,
            has_file     AS hasFile,
            sent_at      AS sentAt,
            read_yn      AS readYn,
            deleted_yn   AS deletedYn
        FROM CHAT_MESSAGES
        WHERE room_id = #{roomId}
        ORDER BY sent_at ASC
    """)
    List<ChatMessageBean> findChatMessagesByRoomId(@Param("roomId") Long roomId);

    //방 참여자인지 여부 확인
    @Select("""
        SELECT COUNT(*)
        FROM DIRECT_CHAT_ROOMS
        WHERE room_id = #{roomId}
          AND (user1_num = #{userNum} OR user2_num = #{userNum})
    """)
    int isRoomMember(@Param("roomId") Long roomId, @Param("userNum") Long userNum);

    //마지막 메세지
    @Update("""
        UPDATE DIRECT_CHAT_ROOMS
        SET last_message_at = SYSDATE
        WHERE room_id = #{roomId}
    """)
    void touchLastMessageAt(@Param("roomId") Long roomId);

}