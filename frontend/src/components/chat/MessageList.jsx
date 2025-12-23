import MessageItem from "./MessageItem";

export default function MessageList({ messages, loginUserNum }) {
  return (
    <div className="message-area">
      {messages.map((m, index) => (
        <MessageItem
          key={m.messageId || `msg-${index}`}
          msg={m}
          isMe={m.senderNum === loginUserNum}
        />
      ))}
    </div>
  );
}
