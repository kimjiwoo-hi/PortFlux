import React from 'react';
import './UserProfilePopover.css';

const UserProfilePopover = ({ isOpen, onLogout }) => {
  return (
    <div className={`profile-popover ${isOpen ? 'active' : ''}`}>
      <div className="popover-header">
        <div className="header-bg"></div>
        <img 
            src="https://i.pravatar.cc/150?img=33" 
            alt="프로필" 
            className="popover-avatar"
        />
        <div className="popover-name">솔데스크</div>
        <div className="popover-email">soldesk@soldesk.com</div>
      </div>
      
      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-number">3</div>
          <div className="stat-label">게시글 수</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">2</div>
          <div className="stat-label">팔로워 수</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">4</div>
          <div className="stat-label">팔로우 수</div>
        </div>
      </div>

      <div className="menu-list">
        <button className="menu-item">내 정보 보기</button>
        <button className="menu-item">장바구니</button>
        <button className="menu-item">채팅방</button>
      </div>

      <div className="popover-footer">
        <button className="btn-logout" onClick={onLogout}>로그아웃</button>
      </div>
    </div>
  );
};

export default UserProfilePopover;
