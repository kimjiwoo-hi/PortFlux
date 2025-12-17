package com.portflux.backend.socket;

import java.util.List;

import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;

import com.portflux.backend.beans.ChatMessageBean;
import com.portflux.backend.service.ChatService;
import com.portflux.backend.socket.dto.JoinRoomPayload;
import com.portflux.backend.socket.dto.ReadRoomPayload;
import com.portflux.backend.socket.dto.SendMessagePayload;

import lombok.RequiredArgsConstructor;

/**
 * Socket 이벤트 표준
 * - room:join         { roomId }               -> 권한검증 후 join
 * - message:list      { roomId }               -> 내(userNum) 기준 메시지 목록 반환
 * - message:send      { roomId, content }      -> DB 저장(사용자별 2행) 후 브로드캐스트
 * - room:read         { roomId }               -> 내 메시지 읽음 처리
 *
 * 인증(개발용):
 * - query param userNum 사용
 *   프론트: io("http://localhost:9092", { query: { userNum } })
 * 운영에서는 JWT 검증으로 변경 권장
 */
@Component
@RequiredArgsConstructor
public class ChatSocketHandler {

    private final ChatService chatService;

    public void register(SocketIOServer server) {

        server.addConnectListener(client -> {
            Long userNum = getUserNum(client);
            if (userNum == null) {
                client.disconnect();
            }
        });

        // 방 참가
        server.addEventListener("room:join", JoinRoomPayload.class, (client, data, ack) -> {
            Long userNum = requireUser(client);
            if (userNum == null) return;

            chatService.assertRoomMember(data.getRoomId(), userNum);
            client.joinRoom(roomKey(data.getRoomId()));

            if (ack != null) ack.sendAckData(true);
        });

        // 메시지 목록(내 기준)
        server.addEventListener("message:list", JoinRoomPayload.class, (client, data, ack) -> {
            Long userNum = requireUser(client);
            if (userNum == null) return;

            List<ChatMessageBean> messages = chatService.getMessagesForUser(data.getRoomId(), userNum);

            // 응답 이벤트로 반환(ACK 대신 이벤트로)
            client.sendEvent("message:list:result", messages);
        });

        // 메시지 전송
        server.addEventListener("message:send", SendMessagePayload.class, (client, data, ack) -> {
            Long userNum = requireUser(client);
            if (userNum == null) return;

            // DB 저장(발신/수신 2행 생성) + last_message_at 갱신
            ChatMessageBean saved = chatService.saveMessageForBoth(
                data.getRoomId(),
                userNum,
                data.getContent(),
                data.getHasFile()
            );

            // 같은 방 전체에게 브로드캐스트
            server.getRoomOperations(roomKey(data.getRoomId()))
                  .sendEvent("message:new", saved);

            if (ack != null) ack.sendAckData(true);
        });

        // 읽음 처리
        server.addEventListener("room:read", ReadRoomPayload.class, (client, data, ack) -> {
            Long userNum = requireUser(client);
            if (userNum == null) return;

            int updated = chatService.markRoomAsRead(data.getRoomId(), userNum);

            // 필요 시 상대에게 "읽음" 이벤트 전파 가능
            client.sendEvent("room:read:result", updated);

            if (ack != null) ack.sendAckData(true);
        });
    }

    private String roomKey(Long roomId) {
        return "room:" + roomId;
    }

    private Long requireUser(SocketIOClient client) {
        Long userNum = getUserNum(client);
        if (userNum == null) client.disconnect();
        return userNum;
    }

    private Long getUserNum(SocketIOClient client) {
        String v = client.getHandshakeData().getSingleUrlParam("userNum");
        if (v == null) return null;
        try { return Long.parseLong(v); } catch (Exception e) { return null; }
    }
}
