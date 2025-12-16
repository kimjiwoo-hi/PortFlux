import { useState, useEffect } from "react";
import "./UserProfilePopover.css";
import { Link } from "react-router-dom";

const UserProfilePopover = ({ isOpen, onLogout }) => {
  const [userInfo, setUserInfo] = useState({
    userName: "",
    userNickname: "",
    userEmail: "",
    userImage: "",
    userBanner: ""
  });

  useEffect(() => {
    if (isOpen) {
      const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
      if (userId) {
        fetch(`http://localhost:8080/user/info/${userId}`)
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
    if (userInfo.userImage) {
      return `data:image/jpeg;base64,${userInfo.userImage}`;
    }
    return "https://i.pravatar.cc/150?img=33";
  };

  const getBannerStyle = () => {
    if (userInfo.userBanner) {
      return {
        backgroundImage: `url(data:image/jpeg;base64,${userInfo.userBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }
    return {};
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
        <Link to="/mypage/myinfo">
          <button className="menu-item">내 정보 보기</button>
        </Link>
        <Link to="/cart">
          <button className="menu-item">장바구니</button>
        </Link>

        <Link to="/chat">
          <button className="menu-item">채팅방</button>
        </Link>
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
