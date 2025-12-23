export default function MessageItem({ msg }) {
  return (
    <div className="message-row">
      <div className="avatar">{(msg.sender || "U")[0].toUpperCase()}</div>

      <div className="message-body">
        <div className="message-head">
          <div className="sender">{msg.sender}</div>
          <div className="time">{msg.time}</div>
        </div>
        <div className="message-text">{msg.text}</div>
      </div>
    </div>
  );
}
