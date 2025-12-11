package com.portflux.backend.service;

import com.portflux.backend.beans.ChatBean;
import com.portflux.backend.beans.ChatMessageBean;
import com.portflux.backend.mapper.ChatMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMapper chatMapper;

    @Transactional
    public ChatBean getOrCreateChatRoom(Long user1Num, Long user2Num) {
        ChatBean chatRoom = chatMapper.findChatRoomByUserIds(user1Num, user2Num);
        if (chatRoom == null) {
            chatRoom = new ChatBean();
            chatRoom.setUser1Num(user1Num);
            chatRoom.setUser2Num(user2Num);
            chatMapper.insertChatRoom(chatRoom);
        }
        return chatRoom;
    }

    @Transactional
    public void saveMessage(ChatMessageBean chatMessage) {
        chatMapper.insertChatMessage(chatMessage);
    }

    public List<ChatMessageBean> getMessages(Long roomId) {
        return chatMapper.findChatMessagesByRoomId(roomId);
    }

    public List<ChatBean> getChatRooms(Long userId) {
        return chatMapper.findChatRoomsByUserId(userId);
    }
}
