import { useEffect, useMemo, useRef, useState } from "react";
import { createChatSocket } from "../api/chatSocket";

/**
 * 채팅 소켓 훅
 * - room join
 * - message list 수신
 * - new message 수신
 * - send, read 이벤트 제공
 */
export function useChatSocket(userNum) {
  const socket = useMemo(() => createChatSocket(userNum), [userNum]);

  const [messages, setMessages] = useState([]);
  const currentRoomIdRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      // 필요 시 로깅
    });

    socket.on("message:list:result", (list) => {
      setMessages(list || []);
    });

    socket.on("message:new", (msg) => {
      // 현재 방 메시지만 반영(간단 필터)
      if (msg?.roomId && currentRoomIdRef.current === msg.roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    //소켓 연결 오류
    socket.on("connect_error", (err) => {
      console.log("[Socket] 연결 오류 발생 : ", err.message);
    });

    //소켓 연결 끊김
    socket.on("disconnect", (reason) => {
      console.error(`[Socket] 연결이 끊어졌습니다 : ${reason}`);
    });

    return () => {
      socket.off("message:list:result");
      socket.off("message:new");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [socket]);

  const joinRoom = (roomId) => {
    currentRoomIdRef.current = roomId;
    socket.emit("room:join", { roomId });
  };

  const loadMessages = (roomId) => {
    currentRoomIdRef.current = roomId;
    socket.emit("message:list", { roomId });
  };

  const sendMessage = (roomId, content) => {
    socket.emit("message:send", { roomId, content, hasFile: "N" });
  };

  const markRead = (roomId) => {
    socket.emit("room:read", { roomId });
  };

  return {
    socket,
    messages,
    setMessages,
    joinRoom,
    loadMessages,
    sendMessage,
    markRead,
  };
}
