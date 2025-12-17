import { useEffect, useState } from "react";
import { getChatRooms } from "../api/chatRest";
import { useChatSocket } from "../hooks/useChatSocket";

/**
 * 최소 예시:
 * - 왼쪽: 방 목록
 * - 오른쪽: 메시지 목록 + 전송
 */
export default function ChatPage({ loginUserNum }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [input, setInput] = useState("");

  const { messages, joinRoom, loadMessages, sendMessage, markRead } = useChatSocket(loginUserNum);

  useEffect(() => {
    (async () => {
      const list = await getChatRooms(loginUserNum);
      setRooms(list);
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
    if (!input.trim()) return;
    sendMessage(activeRoomId, input.trim());
    setInput("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 300, borderRight: "1px solid #ddd", padding: 12 }}>
        <h3>채팅방</h3>
        {rooms.map((r) => (
          <div
            key={r.roomId}
            onClick={() => setActiveRoomId(r.roomId)}
            style={{
              padding: 10,
              cursor: "pointer",
              background: activeRoomId === r.roomId ? "#f5f5f5" : "transparent",
              borderRadius: 8,
            }}
          >
            <div>Room #{r.roomId}</div>
            <small>last: {String(r.lastMessageAt || "")}</small>
          </div>
        ))}
      </aside>

      <main style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column" }}>
        <h3>메시지</h3>

        <div style={{ flex: 1, overflow: "auto", border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          {messages.map((m) => (
            <div key={m.messageId} style={{ marginBottom: 10 }}>
              <b>{m.senderNum}</b>: {m.content}
              <div style={{ fontSize: 12, color: "#666" }}>
                {String(m.sentAt || "")} / read={m.readYn}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지 입력"
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
          />
          <button onClick={onSend} style={{ padding: "10px 16px" }}>
            전송
          </button>
        </div>
      </main>
    </div>
  );
}
