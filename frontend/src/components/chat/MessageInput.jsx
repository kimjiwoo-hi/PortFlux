import { useState } from "react";

export default function MessageInput({ placeholder, onSend, onAttach }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue("");
  };

  return (
    <div className="chat-input">
      <button
        className="icon-btn"
        onClick={onAttach}
        title="첨부"
        type="button"
      >
        +
      </button>

      <div className="input-box">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || "메시지를 입력합니다"}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
      </div>

      <button className="send-btn" onClick={submit} title="전송" type="button">
        ▶
      </button>
    </div>
  );
}
