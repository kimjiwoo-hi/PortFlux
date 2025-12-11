package com.portflux.backend.controller;

import com.portflux.backend.beans.ChatBean;
import com.portflux.backend.beans.ChatMessageBean;
import com.portflux.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatBean>> getChatRooms(@RequestParam Long userId) {
        List<ChatBean> chatRooms = chatService.getChatRooms(userId);
        return ResponseEntity.ok(chatRooms);
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<ChatMessageBean>> getChatMessages(@PathVariable Long roomId) {
        List<ChatMessageBean> messages = chatService.getMessages(roomId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<ChatBean> getOrCreateChatRoom(@RequestBody Map<String, Long> payload) {
        Long user1Num = payload.get("user1Num");
        Long user2Num = payload.get("user2Num");
        ChatBean chatRoom = chatService.getOrCreateChatRoom(user1Num, user2Num);
        return ResponseEntity.ok(chatRoom);
    }
}
