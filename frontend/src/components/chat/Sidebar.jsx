import RoomListItem from "./RoomListItem";

export default function Sidebar({ rooms, activeRoomId, onSelectRoom, me}){
    return(
        <aside className="chat-sidebar">
            <div className="brand">PortFlux</div>
            <div className="sidebar-title">채팅방 목록</div>
            
            <div className="sidebar-section">
                <div className="section-label">임시채팅그룹</div>
                {rooms.map((r) => (
                    <RoomListItem
                        key={r.roomId}
                        room={r}
                        a
                    />
                ))}

            </div>
       
       
       
        </aside>
    )
}
