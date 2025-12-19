import RoomListItem from "./RoomListItem";

/**
 * Sidebar
 * - rooms: 방 목록
 * - activeRoomId: 현재 선택된 방 ID
 * - onSelectRoom: 방 선택 콜백(roomId)
 * - me: 내 표시(이름/상태)
 */
export default function Sidebar({ rooms, activeRoomId, onSelectRoom, me }) {
  return (
    <aside className="chat-sidebar">
      <div className="brand">PortFlux</div>
      <div className="sidebar-title">채팅방목록</div>

      <div className="sidebar-section">
        <div className="section-label">임시채팅그룹</div>

        {rooms.map((r) => (
          <RoomListItem
            key={r.roomId}
            room={r}
            active={r.roomId === activeRoomId}
            onClick={() => onSelectRoom(r.roomId)}
          />
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="avatar">{(me?.name || "U")[0].toUpperCase()}</div>
        <div className="user-meta">
          <div className="name">{me?.name || "User"}</div>
          <div className="status">{me?.status || "온라인"}</div>
        </div>
      </div>
    </aside>
  );
}
