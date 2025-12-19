import { useMemo, useState } from "react";

import ChatLayout from "./ChatLayout";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

// ChatModal
// - loginUserNum: 현재 로그인 사용자(소켓/REST 연결용)
// - onClose: X 버튼 클릭 시 닫기

export default function ChatModal({ loginUserNum, onClose }) {
  //내상태
  const me = { name: `User${loginUserNum}`, status: "온라인" };

  //방목록
  const rooms = useMemo(
    () => [
      { roomId: 1, title: "채팅방1", subtitle: "임시 채팅방입니다" },
      { roomId: 1, title: "채팅방2", subtitle: "임시 채팅방입니다" },
    ],
    []
  );

  //현재 선택된 방
  const [activeRoomId, setActiveRoomId] = useState(1);

  //메시지 목록
  const [messages, setMessages] = useState([
    { id: 1, sender: "User1", time: "p.m 4:30", text: "안녕하세요" },
    { id: 2, sender: "User2", time: "p.m 4:30", text: "안녕하세요" },
    { id: 1, sender: "User1", time: "p.m 4:30", text: "오늘 날씨가 좋네요" },
    { id: 2, sender: "User2", time: "p.m 4:30", text: "밖에 비오는데요" },
  ]);

  const activeRoom = rooms.find((r) => r.roomId === activeRoomId);

  const handleSend = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: me.name, time: "sysdate", text },
    ]);
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
          <MessageList messages={messages} />
          <MessageInput
            placeholder="임시 메세지를 임력합니다"
            onSend={handleSend}
            onAttach={() => alert("첨부")}
          />
        </section>
      }
    />
  );
}
