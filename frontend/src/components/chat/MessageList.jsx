export default function MessageList({ messages }) {
  return (
    <div className="message-area">
      {messages.map((m) => (
        <MessageItem key={m.id} msg={m} />
      ))}
    </div>
  );
}
