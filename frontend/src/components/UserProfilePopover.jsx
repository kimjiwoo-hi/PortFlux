import { useState, useEffect } from "react";
import "./UserProfilePopover.css";
import { Link } from "react-router-dom";
import UserDefaultIcon from "../assets/user_default_icon.png";

const UserProfilePopover = ({ isOpen, onLogout }) => {
  const [userInfo, setUserInfo] = useState({
    userName: "",
    userNickname: "",
    userEmail: "",
    userImage: "",
    userBanner: ""
  });

  const USER_ROLE = localStorage.getItem("role") || sessionStorage.getItem("role") || "USER";

  useEffect(() => {
    if (isOpen) {
      const storage = localStorage.getItem("isLoggedIn") ? localStorage : sessionStorage;
      const userId = storage.getItem("userId");
      
      if (userId) {
        fetch(`http://localhost:8080/user/info/${userId}`)
          .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then(data => {
            const fallbackNickname = storage.getItem("userNickname") || "사용자";
            
            setUserInfo({
              userName: data.userName || data.user_name || "",
              userNickname: data.userNickname || data.user_nickname || fallbackNickname,
              userEmail: data.userEmail || data.user_email || userId,
              userImage: data.userImage || null,
              userBanner: data.userBanner || null
            });
          })
          .catch(error => {
            console.error("사용자 정보 로드 실패:", error);
            // 에러 발생 시 로컬 정보로 최소한의 표시 유지
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
    if (userInfo.userImage) return `data:image/jpeg;base64,${userInfo.userImage}`;
    return UserDefaultIcon;
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
        <img src={getProfileImage()} alt="프로필" className="popover-avatar" />
        <div className="popover-name">{userInfo.userNickname || "사용자"}</div>
      </div>

      <div className="stats-container">
        <div className="stat-item"><div className="stat-number">0</div><div className="stat-label">게시글 수</div></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><div className="stat-number">0</div><div className="stat-label">팔로워 수</div></div>
        <div className="stat-divider"></div>
        <div className="stat-item"><div className="stat-number">0</div><div className="stat-label">팔로우 수</div></div>
      </div>

      <div className="menu-list">
        <Link to={USER_ROLE === "COMPANY" ? "/company/mypage" : "/mypage/myinfo"}>
          <button className="menu-item">
            {USER_ROLE === "COMPANY" ? "기업 정보 관리" : "내 정보 보기"}
          </button>
        </Link>
        <Link to="/cart"><button className="menu-item">장바구니</button></Link>
        <Link to="/chat"><button className="menu-item">채팅방</button></Link>
      </div>

      <div className="popover-footer">
        <button className="btn-logout" onClick={onLogout}>로그아웃</button>
      </div>
    </div>
  );
};

export default UserProfilePopover;