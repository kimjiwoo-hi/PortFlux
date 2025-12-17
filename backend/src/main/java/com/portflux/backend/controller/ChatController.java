package com.portflux.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.portflux.backend.beans.ChatBean;
import com.portflux.backend.beans.ChatMessageBean;
import com.portflux.backend.service.ChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    //내 채팅방 목록
    @GetMapping
    public ResponseEntity<List<ChatBean>> getChatRooms(
        @RequestHeader("X-USER-NUM") Long loginUserNum
    ){
        return ResponseEntity.ok(chatService.getChatRooms(loginUserNum));
    }

    //특정 방 메세지 목록
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<ChatMessageBean>> getChatMessages(
        @RequestHeader("X-USER-NUM") Long loginUserNum,
        @PathVariable Long roomId
    ){
        chatService.assertRoomMember(roomId, loginUserNum);
        return ResponseEntity.ok(chatService.getMessages(roomId));
    }

    //채팅방 생성/조회
    @PostMapping("/room")
    public ResponseEntity<ChatBean> getOrCreateChatRoom(
        @RequestHeader("X-USER-NUM") Long loginUserNum,
        @RequestBody Map<String, Long> payload
    ){
        Long targetUserNum = payload.get("targetUserNum");
        ChatBean room = chatService.getOrCreateChatRoom(loginUserNum, targetUserNum);
        return ResponseEntity.ok(room);
    }

    //방 접근 권한 확인용
    @GetMapping("/{roomId}/access")
    public ResponseEntity<Void> canAccess(
        @RequestHeader("X-USER-NUM") Long loginUserNum,
        @PathVariable Long roomId
    ){
        chatService.assertRoomMember(roomId, loginUserNum);
        return ResponseEntity.ok().build();
    }
    
}
    

    
    
    