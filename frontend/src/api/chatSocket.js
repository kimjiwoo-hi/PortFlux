import { io } from "socket.io-client";

/**
 * Spring 내부에 내장된 Socket.IO 서버(9092)에 직접 연결
 * - query로 userNum 전달(개발용)
 */
export function createChatSocket(userNum) {
  return io("http://localhost:9092", {
    transports: ["websocket"],
    query: { userNum: String(userNum) },
  });
}
