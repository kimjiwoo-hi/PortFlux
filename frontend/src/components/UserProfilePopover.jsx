import { useState, useEffect } from "react";
import "./UserProfilePopover.css";
import { Link, useLocation } from "react-router-dom";
import UserDefaultIcon from "../assets/user_default_icon.png";
import { fetchUserInfo, getCachedUserInfo } from "../utils/userInfoCache";

const UserProfilePopover = ({ isOpen, onLogout, onClose }) => {
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
      const loadUserInfo = async () => {
        // 먼저 캐시 확인 - 즉시 적용
        const cachedInfo = getCachedUserInfo();
        if (cachedInfo) {
          setUserInfo(cachedInfo);
          return;
        }

        // 캐시가 없으면 API 호출
        try {
          const info = await fetchUserInfo();
          setUserInfo(info);
        } catch (error) {
          console.error("User info fetch error:", error);
          const storage = localStorage.getItem("isLoggedIn") ? localStorage : sessionStorage;
          const userId = storage.getItem("userId");
          setUserInfo(prev => ({
            ...prev,
            userNickname: storage.getItem("userNickname") || "사용자",
            userEmail: userId || ""
          }));
        }
      };

      loadUserInfo();
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

  const handleMenuClick = (path) => (e) => {
    const myPagePath = USER_ROLE === "COMPANY" ? "/company/mypage" : `/mypage/${userInfo.userNickname}`;
    const isOnMyPage = location.pathname.startsWith('/mypage/');
    const isSamePath = location.pathname === path;

    // 내 정보 보기를 클릭했고 이미 마이페이지에 있는 경우
    if (path === myPagePath && isOnMyPage) {
      e.preventDefault();
      onClose?.();
      window.location.reload();
      return;
    }

    // Popover 닫기
    onClose?.();

    // 같은 경로면 리프레시
    if (isSamePath) {
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
        <Link
          to={USER_ROLE === "COMPANY" ? "/company/mypage" : `/mypage/${userInfo.userNickname}`}
          onClick={handleMenuClick(USER_ROLE === "COMPANY" ? "/company/mypage" : `/mypage/${userInfo.userNickname}`)}
        >
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
