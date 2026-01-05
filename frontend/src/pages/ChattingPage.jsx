import { useEffect, useState } from "react";
import { getChatRooms } from "../api/chatRest";
import { useChatSocket } from "../hooks/useChatSocket";
import "./ChattingPage.css";


export default function ChatPage({ loginUserNum }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [input, setInput] = useState("");

  const { messages, joinRoom, loadMessages, sendMessage, markRead } =
    useChatSocket(loginUserNum);

  useEffect(() => {
    (async () => {
      try {
        const list = await getChatRooms(loginUserNum);
        setRooms(list);
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error);
      }
    })();
  }, [loginUserNum]);

  useEffect(() => {
    if (!activeRoomId) return;

    // 방 조인 + 메시지 로드 + 읽음 처리
    joinRoom(activeRoomId);
    loadMessages(activeRoomId);
    markRead(activeRoomId);
  }, [activeRoomId, joinRoom, loadMessages, markRead]);

  const onSend = () => {
    if (!activeRoomId) return;
    const text = input.trim();
    if (!text) return;

    sendMessage(activeRoomId, text);
    setInput("");
  };

  return (
    <div className="chatting-page">
      {/* 좌측: 방 목록 */}
      <aside className="chatting-sidebar">
        <h3>채팅방</h3>

        {rooms.map((r) => (
          <div
            key={r.roomId}
            className={`room-item ${activeRoomId === r.roomId ? "active" : ""}`}
            onClick={() => setActiveRoomId(r.roomId)}
          >
            <div>
              <b>Room #{r.roomId}</b>
            </div>
            <small>last: {String(r.lastMessageAt || "")}</small>
          </div>
        ))}
      </aside>

      {/* 우측: 메시지 */}
      <main className="chatting-main">
        <h3>메시지</h3>

        <div className="message-list">
          {messages.map((m) => (
            <div key={m.messageId} className="message">
              <div>
                <b>{m.senderNum}</b>: {m.content}
              </div>
              <div className="message-meta">
                {String(m.sentAt || "")} / read={m.readYn}
              </div>
            </div>
          ))}
        </div>

        <div className="message-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지 입력"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
          />
          <button onClick={onSend}>전송</button>
        </div>
      </main>
    </div>
  );
}
