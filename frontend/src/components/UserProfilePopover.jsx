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

  useEffect(() => {
    if (isOpen) {
      // 로그인 시 저장했던 ID 가져오기
      const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
      
      if (userId) {
        // 백엔드에서 사용자 정보 조회
        fetch(`http://localhost:8080/user/info/${userId}`)
          .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then(data => {
            // DB 컬럼명에 따라 매핑 (스네이크/카멜 케이스 모두 고려)
            const fallbackNickname = localStorage.getItem("userNickname") || "사용자";
            
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
            // 로드 실패 시 로컬 스토리지 정보 등으로 대체
            setUserInfo(prev => ({
                ...prev,
                userNickname: localStorage.getItem("userNickname") || "사용자",
                userEmail: userId
            }));
          });
      }
    }
  }, [isOpen]);

  const getProfileImage = () => {
    if (userInfo.userImage) {
      // DB에 BLOB 등 이미지 데이터가 있는 경우
      return `data:image/jpeg;base64,${userInfo.userImage}`;
    }
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
    return {}; // CSS에 정의된 기본 배경 사용
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
        
        <div className="popover-name">
            {userInfo.userNickname || "사용자"}
        </div>
        {/* [수정] 아이디(이메일) 표시 부분 삭제함 */}
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