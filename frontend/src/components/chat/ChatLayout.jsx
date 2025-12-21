// left : 좌측 사이드바
//right : 우측 본문
//onClose : 닫기

export default function ChatLayout({ left, right, onClose }) {
  return (
    <div className="chat-shell">
      <div className="chat-modal">
        {/*닫기*/}
        <button
          className="chat-close"
          onClick={onClose}
          aria-label="colse"
        >X</button>
      </div>
      {left}
      {right}
    </div>
  );
}
