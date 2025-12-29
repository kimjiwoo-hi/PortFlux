import React, { useState, useEffect } from "react";
import "./UserProfilePopover.css";
import { Link, useLocation } from "react-router-dom";
import UserDefaultIcon from "../assets/user_default_icon.png";

const UserProfilePopover = ({ isOpen, onLogout }) => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({
    userName: "",
    userNickname: "",
    userEmail: "",
    userImage: null,
    userBanner: null
  });

  const USER_ROLE = localStorage.getItem("role") || sessionStorage.getItem("role") || "USER";

  useEffect(() => {
    if (isOpen) {
      const storage = localStorage.getItem("isLoggedIn") ? localStorage : sessionStorage;
      let userId = storage.getItem("userId");
      
      if (!userId) {
        const storedUser = storage.getItem("user");
        if (storedUser) {
          try {
            userId = JSON.parse(storedUser).userId;
          } catch {
            console.warn("저장된 사용자 정보를 읽을 수 없습니다.");
          }
        }
      }
      
      if (userId) {
        fetch(`http://localhost:8080/user/info/${userId}`)
          .then(response => response.ok ? response.json() : Promise.reject())
          .then(data => {
            setUserInfo({
              userName: data.userName || data.user_name || "",
              userNickname: data.userNickname || data.user_nickname || storage.getItem("userNickname") || "사용자",
              userEmail: data.userEmail || data.user_email || userId,
              userImage: data.userImage || null,
              userBanner: data.userBanner || null
            });
          })
          .catch(() => {
            // error 변수 제거
            setUserInfo(prev => ({
              ...prev,
              userNickname: storage.getItem("userNickname") || "사용자",
              userEmail: userId
            }));
          });
      }
    }
  }, [isOpen]);

  const getProfileImage = () => {
    if (userInfo.userImage && userInfo.userImage.trim() !== "") return userInfo.userImage;
    return UserDefaultIcon;
  };

  const getBannerStyle = () => {
    if (userInfo.userBanner && userInfo.userBanner.trim() !== "") {
      return {
        backgroundImage: `url(${userInfo.userBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }
    return { backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" };
  };

  const handleMenuClick = (path) => () => {
    if (location.pathname === path) {
      window.location.reload();
    }
  };

  return (
    <div className={`profile-popover ${isOpen ? "active" : ""}`}>
      <div className="popover-header">
        <div className="header-bg" style={getBannerStyle()}></div>
        <img src={getProfileImage()} alt="프로필" className="popover-avatar" />
        <div className="popover-name">{userInfo.userNickname || "사용자"}</div>
        <div className="popover-email">{userInfo.userEmail}</div>
      </div>

      <div className="stats-container">
        <div className="stat-item"><div className="stat-number">0</div><div className="stat-label">게시글</div></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><div className="stat-number">0</div><div className="stat-label">팔로워</div></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><div className="stat-number">0</div><div className="stat-label">팔로우</div></div>
      </div>

      <div className="menu-list">
        <Link to={USER_ROLE === "COMPANY" ? "/company/mypage" : "/mypage/myinfo"} onClick={handleMenuClick(USER_ROLE === "COMPANY" ? "/company/mypage" : "/mypage/myinfo")}>
          <button className="menu-item">{USER_ROLE === "COMPANY" ? "기업 정보 관리" : "내 정보 보기"}</button>
        </Link>
        <Link to="/cart" onClick={handleMenuClick("/cart")}><button className="menu-item">장바구니</button></Link>
        <Link to="/order-list" onClick={handleMenuClick("/order-list")}><button className="menu-item">주문 내역</button></Link>
        <Link to="/chat" onClick={handleMenuClick("/chat")}><button className="menu-item">채팅방</button></Link>
      </div>

      <div className="popover-footer">
        <button className="btn-logout" onClick={onLogout}>로그아웃</button>
      </div>
    </div>
  );
};

export default UserProfilePopover;