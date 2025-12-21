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

    /**
     * 채팅방 조회 및 생성
     * - user1/user2는 무조건 (min, max)로 저장하여 중복 방 생성 가능성을 줄임
     */
    @Transactional
    public ChatBean getOrCreateChatRoom(Long user1Num, Long user2Num) {

        if (user1Num == null || user2Num == null) {
            throw new IllegalArgumentException("user1Num/user2Num은 필수 입니다.");
        }
        if (user1Num.equals(user2Num)) {
            throw new IllegalArgumentException("자기 자신과 채팅은 생성할 수 없습니다.");
        }

        long a = Math.min(user1Num, user2Num);
        long b = Math.max(user1Num, user2Num);

        ChatBean chatRoom = chatMapper.findChatRoomByUserIds(a, b);
        if (chatRoom == null) {
            chatRoom = new ChatBean();
            chatRoom.setUser1Num(a);
            chatRoom.setUser2Num(b);
            chatMapper.insertChatRoom(chatRoom);
        }
        return chatRoom;
    }

    /**
     * (최종안 핵심) 메시지 저장을 "사용자별 2행"으로 저장
     * - sender용 행: userNum=sender, readYn='Y'
     * - receiver용 행: userNum=receiver, readYn='N'
     *
     * 반환값: 발신자 행(저장 직후 조회) -> 소켓 브로드캐스트 페이로드로 사용 가능
     */
    @Transactional
    public ChatMessageBean saveMessageForBoth(Long roomId, Long senderNum, String content, String hasFile) {

        if (roomId == null || senderNum == null) {
            throw new IllegalArgumentException("roomId/senderNum은 필수입니다.");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("content는 필수입니다.");
        }

        // 권한 검증 (발신자가 해당 방 참여자인지)
        assertRoomMember(roomId, senderNum);

        ChatBean room = chatMapper.findChatRoomById(roomId);
        if (room == null) {
            throw new RuntimeException("존재하지 않는 채팅방입니다.");
        }

        // 수신자 계산: 방 참여자 2명 중 sender가 아닌 쪽
        Long receiverNum = senderNum.equals(room.getUser1Num()) ? room.getUser2Num() : room.getUser1Num();

        String fileFlag = (hasFile == null || hasFile.isBlank()) ? "N" : hasFile;

        // 1) 발신자 행 저장 (발신자는 본인 메시지를 즉시 읽은 상태로 처리)
        ChatMessageBean senderRow = new ChatMessageBean();
        senderRow.setRoomId(roomId);
        senderRow.setUserNum(senderNum);
        senderRow.setSenderNum(senderNum);
        senderRow.setContent(content);
        senderRow.setHasFile(fileFlag);
        senderRow.setReadYn("Y");
        senderRow.setDeletedYn("N");
        chatMapper.insertChatMessage(senderRow);

        // 2) 수신자 행 저장 (수신자는 읽지 않은 상태)
        ChatMessageBean receiverRow = new ChatMessageBean();
        receiverRow.setRoomId(roomId);
        receiverRow.setUserNum(receiverNum);
        receiverRow.setSenderNum(senderNum);
        receiverRow.setContent(content);
        receiverRow.setHasFile(fileFlag);
        receiverRow.setReadYn("N");
        receiverRow.setDeletedYn("N");
        chatMapper.insertChatMessage(receiverRow);

        // 방 리스트 최신 정렬을 위해 last_message_at 갱신
        chatMapper.touchLastMessageAt(roomId);

        // sentAt 확보를 위해 발신자 행을 재조회(Oracle SYSDATE 기반)
        return chatMapper.findMessageById(senderRow.getMessageId());
    }

    /**
     * 메시지 목록: "내(userNum) 기준"으로만 반환
     */
    public List<ChatMessageBean> getMessagesForUser(Long roomId, Long userNum) {
        assertRoomMember(roomId, userNum);
        return chatMapper.findChatMessagesByRoomIdForUser(roomId, userNum);
    }

    public List<ChatBean> getChatRooms(Long userNum) {
        return chatMapper.findChatRoomsByUserNum(userNum);
    }

    public void assertRoomMember(Long roomId, Long userNum) {
        int cnt = chatMapper.isRoomMember(roomId, userNum);
        if (cnt <= 0) {
            throw new RuntimeException("채팅방 접근 권한이 없습니다.");
        }
    }

    /**
     * 방 전체 읽음 처리(내 메시지 중 미읽음을 읽음으로)
     */
    @Transactional
    public int markRoomAsRead(Long roomId, Long userNum) {
        assertRoomMember(roomId, userNum);
        return chatMapper.markRoomAsRead(roomId, userNum);
    }
}
