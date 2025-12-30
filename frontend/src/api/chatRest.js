/**
 * 개발 단계에서만 X-USER-NUM 헤더로 사용자 식별
 * (운영에서는 JWT Authorization으로 교체 권장)
 */
const BASE = "";

function headers(userNum) {
  return {
    "Content-Type": "application/json",
    "X-USER-NUM": String(userNum),
  };
}

export async function getChatRooms(userNum) {
  const res = await fetch(`${BASE}/api/chats`, { headers: headers(userNum) });
  if (!res.ok) throw new Error("채팅방 목록 조회 실패");
  return res.json();
}

export async function getOrCreateRoom(userNum, targetUserNum) {
  const res = await fetch(`${BASE}/api/chats/room`, {
    method: "POST",
    headers: headers(userNum),
    body: JSON.stringify({ targetUserNum }),
  });
  if (!res.ok) throw new Error("채팅방 생성/조회 실패");
  return res.json();
}

export async function getMessages(userNum, roomId) {
  const res = await fetch(`${BASE}/api/chats/${roomId}/messages`, {
    headers: headers(userNum),
  });
  if (!res.ok) throw new Error("메시지 목록 조회 실패");
  return res.json();
}
