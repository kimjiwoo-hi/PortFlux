export default function ChatHeader({ room }) {
  return (
    <div className="chat-header">
      <div className="title"># {room?.title || "채팅방"}</div>
      <div className="sub">{room?.subtitle || "임시 채팅방입니다"}</div>
      <div className="chat-divider" />
    </div>
  );
}
