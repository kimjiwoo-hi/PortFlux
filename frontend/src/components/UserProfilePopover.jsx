
import { useState, useEffect } from "react";
import "./UserProfilePopover.css";
import { Link, useLocation } from "react-router-dom";
import UserDefaultIcon from "../assets/user_default_icon.png";

const UserProfilePopover = ({ isOpen, onLogout }) => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({
    userName: "",
    userNickname: "",
    userEmail: "",
    userImage: "",
    userBanner: ""
  });

  useEffect(() => {
    if (isOpen) {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        fetch(`/api/user/info/${user.userId}`)
          .then(response => response.json())
          .then(data => {
            setUserInfo({
              userName: data.userName || "",
              userNickname: data.userNickname || "",
              userEmail: data.userEmail || "",
              userImage: data.userImage || "",
              userBanner: data.userBanner || ""
            });
          })
          .catch(error => {
            console.error("사용자 정보 로드 실패:", error);
          });
      }
    }
  }, [isOpen]);

  const getProfileImage = () => {
    if (userInfo.userImage && userInfo.userImage.trim() !== "") {
      // 백엔드에서 이미 "data:image/jpeg;base64," 접두사를 포함해서 보냄
      return userInfo.userImage;
    }
    return UserDefaultIcon;
  };

  const getBannerStyle = () => {
    if (userInfo.userBanner && userInfo.userBanner.trim() !== "") {
      // 백엔드에서 이미 "data:image/jpeg;base64," 접두사를 포함해서 보냄
      return {
        backgroundImage: `url(${userInfo.userBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }
    // 기본 배너 스타일 (그라데이션)
    return {
      backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      backgroundSize: "cover",
      backgroundPosition: "center"
    };
  };

  const handleMenuClick = (path) => (e) => {
    // 현재 페이지와 같은 경로를 클릭한 경우 새로고침
    if (location.pathname === path) {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <div className={`profile-popover ${isOpen ? "active" : ""}`}>
      <div className="popover-header">
        <div className="header-bg" style={getBannerStyle()}></div>
        <img
          src={getProfileImage()}
          alt="프로필"
          className="popover-avatar"
        />
        <div className="popover-name">{userInfo.userNickname || userInfo.userName || "사용자"}</div>
        <div className="popover-email">{userInfo.userEmail || ""}</div>
      </div>

      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-number">0</div>
          <div className="stat-label">게시글 수</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">0</div>
          <div className="stat-label">팔로워 수</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">0</div>
          <div className="stat-label">팔로우 수</div>
        </div>
      </div>

      <div className="menu-list">
        <Link to="/mypage/myinfo" onClick={handleMenuClick("/mypage/myinfo")}>
          <button className="menu-item">내 정보 보기</button>
        </Link>
        <Link to="/cart" onClick={handleMenuClick("/cart")}>
          <button className="menu-item">장바구니</button>
        </Link>
        <Link to="/order-list" onClick={handleMenuClick("/order-list")}>
          <button className="menu-item">주문 내역</button>
        </Link>
        {/*
        <Link to="/chat" onClick={handleMenuClick("/chat")}>
          <button className="menu-item">채팅방</button>
        </Link>
        */}
      </div>

      <div className="popover-footer">
        <button className="btn-logout" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default UserProfilePopover;
