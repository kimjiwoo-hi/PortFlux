import { useEffect, useState } from "react";
import ChatLayout from "./ChatLayout";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChatSocket } from "../../hooks/useChatSocket";
import { getChatRooms } from "../../api/chatRest";

// ChatModal
// - loginUserNum: 현재 로그인 사용자(소켓/REST 연결용)
// - onClose: X 버튼 클릭 시 닫기
export default function ChatModal({ loginUserNum, onClose }) {
  //내상태
  const me = { name: `User${loginUserNum}`, status: "온라인" };
  //방목록
  const [rooms, setRooms] = useState([]);
  //현재 선택된 방
  const [activeRoomId, setActiveRoomId] = useState(null);
  const { messages, joinRoom, loadMessages, sendMessage } =
    useChatSocket(loginUserNum);

  // 1. 로그인 사용자의 채팅방 목록 불러오기
  useEffect(() => {
    if (!loginUserNum) return;
    (async () => {
      const roomList = await getChatRooms(loginUserNum);
      setRooms(roomList);
      // 첫 번째 방을 활성 방으로 자동 선택
      if (roomList.length > 0) {
        setActiveRoomId(roomList[0].roomId);
      }
    })();
  }, [loginUserNum]);

  // 2. 활성 방이 변경되면, 해당 방에 조인하고 메시지 불러오기
  useEffect(() => {
    if (!activeRoomId) return;

    joinRoom(activeRoomId);
    loadMessages(activeRoomId);
  }, [activeRoomId, joinRoom, loadMessages]);

  const activeRoom = rooms.find((r) => r.roomId === activeRoomId);

  const handleSend = (text) => {
    if (!activeRoomId || !text.trim()) return;
    sendMessage(activeRoomId, text.trim());
  };

  return (
    <ChatLayout
      onClose={onClose}
      left={
        <Sidebar
          rooms={rooms}
          activeRoomId={activeRoomId}
          onSelectRoom={setActiveRoomId}
          me={me}
        />
      }
      right={
        <section className="chat-main">
          <ChatHeader room={activeRoom} />
          <MessageList messages={messages} loginUserNum={loginUserNum} />
          <MessageInput
            placeholder="메시지를 입력하세요"
            onSend={handleSend}
            onAttach={() => alert("첨부 기능은 준비중입니다.")}
          />
        </section>
      }
    />
  );
}
