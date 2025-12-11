package com.portflux.backend.mapper;

import com.portflux.backend.beans.ChatBean;
import com.portflux.backend.beans.ChatMessageBean;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ChatMapper {

    @Select("SELECT * FROM CHATS WHERE (user1_num = #{user1Num} AND user2_num = #{user2Num}) OR (user1_num = #{user2Num} AND user2_num = #{user1Num})")
    ChatBean findChatRoomByUserIds(@Param("user1Num") Long user1Num, @Param("user2Num") Long user2Num);

    @Insert("INSERT INTO CHATS (user1_num, user2_num, created_at, last_message_at, status) VALUES (#{user1Num}, #{user2Num}, SYSDATE, SYSDATE, 'ACTIVE')")
    @Options(useGeneratedKeys = true, keyProperty = "roomId", keyColumn = "room_id")
    void insertChatRoom(ChatBean chatBean);

    @Select("SELECT * FROM CHATS WHERE user1_num = #{userId} OR user2_num = #{userId}")
    List<ChatBean> findChatRoomsByUserId(Long userId);

    @Insert("INSERT INTO CHAT_MESSAGES (room_id, user_num, sender_num, content, has_file, sent_at, read_yn, delete_yn) " +
            "VALUES (#{roomId}, #{userNum}, #{senderNum}, #{content}, #{hasFile}, SYSDATE, #{readYn}, #{deleteYn})")
    @Options(useGeneratedKeys = true, keyProperty = "messageId", keyColumn = "message_id")
    void insertChatMessage(ChatMessageBean chatMessageBean);

    @Select("SELECT * FROM CHAT_MESSAGES WHERE room_id = #{roomId} ORDER BY sent_at ASC")
    List<ChatMessageBean> findChatMessagesByRoomId(Long roomId);
}