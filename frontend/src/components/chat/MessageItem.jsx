export default function MessageItem({ msg, isMe }) {
  const messageRowClass = isMe ? "message-row is-me" : "message-row";
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className={messageRowClass}>
      <div className="avatar">{/* Avatar Logic Here */}</div>
      <div className="message-body">
        <div className="message-head">
          <div className="sender">User {msg.senderNum}</div>
          <div className="time">{formatTime(msg.sentAt)}</div>
        </div>
        <div className="message-text">{msg.content}</div>
      </div>
    </div>
  );
}
