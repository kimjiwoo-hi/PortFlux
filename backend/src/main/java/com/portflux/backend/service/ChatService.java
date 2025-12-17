package com.portflux.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.portflux.backend.beans.ChatBean;
import com.portflux.backend.beans.ChatMessageBean;
import com.portflux.backend.mapper.ChatMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final ChatMapper chatMapper;

    //채팅방 조회 및 생성

    @Transactional
    public ChatBean getOrCreateChatRoom(Long userNum, Long senderNum){

        if(userNum == null || senderNum == null){
            throw new IllegalArgumentException("user1Num/user2Num은 필수 입니다.");
        }
        if(userNum.equals(senderNum)){
            throw new IllegalArgumentException("자기 자신과 채팅은 생성할 수 없습니다.");
        }

        long a = Math.min(userNum, senderNum);
        long b = Math.max(userNum, senderNum);

        ChatBean chatRoom = chatMapper.findChatRoomByUserIds(a, b);
        if(chatRoom == null){
            chatRoom = new ChatBean();
            chatRoom.setUserNum(a);
            chatRoom.setSenderNum(b);
            chatMapper.insertChatRoom(chatRoom);
        }
        return chatRoom;
    }

    //메세지 저장 + 마지막 메세지 시간 갱신
    @Transactional
    public void saveMessage(ChatMessageBean chatMessage){
        chatMapper.insertChatMessage(chatMessage);
        chatMapper.touchLastMessageAt(chatMessage.getRoomId());
    }

    public List<ChatMessageBean> getMessages(Long roomId){
        return chatMapper.findChatMessagesByRoomId(roomId);
    }

    public List<ChatBean> getChatRooms(Long userNum){
        return chatMapper.findChatRoomsByUserNum(userNum);
    }

    //방 참여자 검증
    public void assertRoomMember(Long roomId, Long userNum){
        int cnt = chatMapper.isRoomMember(roomId, userNum);
        if(cnt<=0){
            throw new RuntimeException("채팅방 접근 권한이 없습니다.");
        }
    }
}