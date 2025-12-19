export default function RoomListItem({ room, active, onClick }) {
  return (
    <div className={`room-item ${active ? "active" : ""}`} onClick={onClick}>
      <div className="room-name">{room.title}</div>
    </div>
  );
}
