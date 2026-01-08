import { useState, useEffect, useRef } from "react";
import "./UserProfilePopover.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserDefaultIcon from "../assets/user_default_icon.png";
import { fetchUserInfo, getCachedUserInfo } from "../utils/userInfoCache";
import { getFollowers, getFollowing } from "../api/api";
import axios from "axios";
import FollowListPopover from "./FollowListPopover";

const UserProfilePopover = ({ isOpen, onLogout, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userName: "",
    userNickname: "",
    userEmail: "",
    userImage: null,
    userBanner: null
  });

  const [postCount, setPostCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showAbove, setShowAbove] = useState(false);
  const [isCompany, setIsCompany] = useState(false); // 기업 회원 여부
  const popoverRef = useRef(null);

  // 팔로우 리스트 팝오버
  const [showFollowPopover, setShowFollowPopover] = useState(false);
  const [followPopoverTab, setFollowPopoverTab] = useState('followers');
  const followersRef = useRef(null);
  const followingRef = useRef(null);

  // Popover 위치 계산
  useEffect(() => {
    if (isOpen && popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.top;
      const popoverHeight = 600; // 대략적인 popover 높이

      // 아래 공간이 부족하면 위로 표시
      setShowAbove(spaceBelow < popoverHeight);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // 기업 회원 여부 확인
      const memberType = localStorage.getItem("memberType") || sessionStorage.getItem("memberType");
      setIsCompany(memberType === "company");

      const loadUserInfo = async () => {
        // 먼저 캐시 확인 - 즉시 적용
        const cachedInfo = getCachedUserInfo();
        if (cachedInfo) {
          setUserInfo(cachedInfo);
          // 게시글 수 조회
          if (cachedInfo.userNickname) {
            loadPostCount(cachedInfo.userNickname);
          }
          return;
        }

        // 캐시가 없으면 API 호출
        try {
          const info = await fetchUserInfo();
          setUserInfo(info);
          // 게시글 수 조회
          if (info.userNickname) {
            loadPostCount(info.userNickname);
          }
        } catch (error) {
          console.error("User info fetch error:", error);
          const storage = localStorage.getItem("isLoggedIn") ? localStorage : sessionStorage;
          const userId = storage.getItem("userId");
          const nickname = storage.getItem("userNickname");
          setUserInfo(prev => ({
            ...prev,
            userNickname: nickname || "사용자",
            userEmail: userId || ""
          }));
          // 게시글 수 조회
          if (nickname) {
            loadPostCount(nickname);
          }
        }
      };

      const loadPostCount = async (nickname) => {
        try {
          const response = await axios.get(`/api/boardlookup/user/nickname/${nickname}/posts`);
          setPostCount(response.data.length || 0);
        } catch (error) {
          console.error("게시글 수 조회 실패:", error);
          setPostCount(0);
        }
      };

      const loadFollowCounts = async (userNum) => {
        try {
          const [followersRes, followingRes] = await Promise.all([
            getFollowers(userNum),
            getFollowing(userNum)
          ]);
          setFollowersCount(followersRes.data.count || 0);
          setFollowingCount(followingRes.data.count || 0);
        } catch (error) {
          console.error("팔로우 수 조회 실패:", error);
          setFollowersCount(0);
          setFollowingCount(0);
        }
      };

      loadUserInfo();

      // 팔로우 수 조회 (userNum 필요)
      const userNumStr = localStorage.getItem("userNum") || sessionStorage.getItem("userNum");
      if (userNumStr) {
        loadFollowCounts(userNumStr);
      }
    }
  }, [isOpen]);

  // 프로필 업데이트 이벤트 리스너
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const { userImage, userBanner, userNickname } = event.detail;
      console.log("Popover: 프로필 업데이트 이벤트 수신");
      setUserInfo(prev => ({
        ...prev,
        userImage: userImage || prev.userImage,
        userBanner: userBanner || prev.userBanner,
        userNickname: userNickname || prev.userNickname
      }));
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

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
    const myPagePath = `/mypage/${userInfo.userNickname}`;
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

  const handlePostsClick = () => {
    const myPagePath = `/mypage/${userInfo.userNickname}`;
    onClose?.();
    navigate(myPagePath, { state: { activeTab: 'posts' } });
  };

  return (
    <>
    <div ref={popoverRef} className={`profile-popover ${isOpen ? "active" : ""} ${showAbove ? "show-above" : ""}`}>
      <div className="popover-header">
        <div className="header-bg" style={getBannerStyle()}></div>
        <img src={getProfileImage()} alt="프로필" className="popover-avatar" />
        <div className="popover-name">{userInfo.userNickname || "사용자"}</div>
        <div className="popover-email">{userInfo.userEmail}</div>
      </div>

      <div className="stats-container">
        <div
          className="stat-item clickable"
          onClick={handlePostsClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-number">{postCount}</div>
          <div className="stat-label">게시글</div>
        </div>
        {/* 팔로우 통계 - 기업회원일 때는 숨김 */}
        {!isCompany && (
          <>
            <div className="stat-divider"></div>
            <div
              className="stat-item clickable"
              ref={followersRef}
              onClick={(e) => {
                e.stopPropagation();
                setFollowPopoverTab('followers');
                setShowFollowPopover(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-number">{followersCount}</div>
              <div className="stat-label">팔로워</div>
            </div>
            <div className="stat-divider"></div>
            <div
              className="stat-item clickable"
              ref={followingRef}
              onClick={(e) => {
                e.stopPropagation();
                setFollowPopoverTab('following');
                setShowFollowPopover(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-number">{followingCount}</div>
              <div className="stat-label">팔로잉</div>
            </div>
          </>
        )}
      </div>

      <div className="menu-list">
        <Link
          to={`/mypage/${userInfo.userNickname}`}
          onClick={handleMenuClick(`/mypage/${userInfo.userNickname}`)}
        >
          <button className="menu-item">내 정보 보기</button>
        </Link>
        <Link to="/cart" onClick={handleMenuClick("/cart")}><button className="menu-item">장바구니</button></Link>
        <Link to="/order-list" onClick={handleMenuClick("/order-list")}><button className="menu-item">주문 내역</button></Link>
      </div>

      <div className="popover-footer">
        <button className="btn-logout" onClick={onLogout}>로그아웃</button>
      </div>
    </div>

    {/* 팔로우 리스트 팝오버 */}
    {showFollowPopover && (() => {
      const userNumStr = localStorage.getItem("userNum") || sessionStorage.getItem("userNum");
      return userNumStr ? (
        <FollowListPopover
          userNum={userNumStr}
          initialTab={followPopoverTab}
          onClose={() => setShowFollowPopover(false)}
          anchorEl={null}
        />
      ) : null;
    })()}
    </>
  );
};

export default UserProfilePopover;
