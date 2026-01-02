import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./UserMiniPopover.css";
import { useNavigate } from "react-router-dom";
import UserDefaultIcon from "../assets/user_default_icon.png";
import { getFollowers, getFollowing, follow, unfollow, isFollowing as checkFollowing } from "../api/api";
import axios from "axios";
import FollowListPopover from "./FollowListPopover";

const UserMiniPopover = ({ nickname, isVisible, position, onMouseEnter, onMouseLeave }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userNickname: "",
    userImage: null,
    userBanner: null,
    userNum: null,
  });
  const [postCount, setPostCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef(null);

  // 팔로우 상태
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 팔로우 리스트 팝오버
  const [showFollowPopover, setShowFollowPopover] = useState(false);
  const [followPopoverTab, setFollowPopoverTab] = useState('followers');
  const followersRef = useRef(null);
  const followingRef = useRef(null);

  // Popover 위치 계산 - 렌더링 중 계산
  const showAbove = (() => {
    if (isVisible && position) {
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - position.top;
      const popoverHeight = 350; // 대략적인 mini popover 높이
      return spaceBelow < popoverHeight;
    }
    return false;
  })();

  useEffect(() => {
    if (isVisible && nickname) {
      const loadUserInfo = async () => {
        try {
          setLoading(true);
          // 게시글 목록 조회로 사용자 정보와 게시글 수 한 번에 가져오기
          const response = await axios.get(
            `http://localhost:8080/api/boardlookup/user/nickname/${nickname}/posts`,
            { withCredentials: true }
          );

          setPostCount(response.data.length || 0);

          // 첫 번째 게시글에서 사용자 정보 추출
          if (response.data.length > 0) {
            const firstPost = response.data[0];

            // Base64 이미지 처리 - userImage와 userBanner 필드 사용
            let profileImage = null;
            const imageData = firstPost.userImageBase64 || firstPost.userImage;
            if (imageData) {
              // data: 프리픽스가 이미 있으면 그대로 사용, 아니면 추가
              if (imageData.startsWith('data:')) {
                profileImage = imageData;
              } else if (imageData.startsWith('/uploads/')) {
                // 서버 파일 경로인 경우
                profileImage = `http://localhost:8080${imageData}`;
              } else {
                // Base64 문자열인 경우
                profileImage = `data:image/jpeg;base64,${imageData}`;
              }
            }

            let bannerImage = null;
            const bannerData = firstPost.userBannerBase64 || firstPost.userBanner;
            if (bannerData) {
              // data: 프리픽스가 이미 있으면 그대로 사용, 아니면 추가
              if (bannerData.startsWith('data:')) {
                bannerImage = bannerData;
              } else if (bannerData.startsWith('/uploads/')) {
                // 서버 파일 경로인 경우
                bannerImage = `http://localhost:8080${bannerData}`;
              } else {
                // Base64 문자열인 경우
                bannerImage = `data:image/jpeg;base64,${bannerData}`;
              }
            }

            setUserInfo({
              userNickname: firstPost.userNickname || nickname,
              userImage: profileImage,
              userBanner: bannerImage,
              userNum: firstPost.userNum,
            });

            // 본인 여부 확인
            const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (storedUser) {
              const user = JSON.parse(storedUser);
              const currentUserNickname = user.userNickname || localStorage.getItem("userNickname") || sessionStorage.getItem("userNickname");
              setIsOwner(currentUserNickname === nickname);
            }

            // 팔로워/팔로잉 수 조회 및 팔로우 상태 확인
            if (firstPost.userNum) {
              loadFollowCounts(firstPost.userNum);

              // 다른 사용자인 경우 팔로우 상태 확인
              if (storedUser) {
                const user = JSON.parse(storedUser);
                const currentUserNickname = user.userNickname || localStorage.getItem("userNickname") || sessionStorage.getItem("userNickname");
                if (currentUserNickname !== nickname) {
                  checkFollowStatus(firstPost.userNum);
                }
              }
            }
          } else {
            // 게시글이 없는 경우 기본값 설정
            setUserInfo({
              userNickname: nickname,
              userImage: null,
              userBanner: null,
            });
          }
          setLoading(false);
        } catch (error) {
          console.error("사용자 정보 로드 실패:", error);
          setUserInfo({
            userNickname: nickname,
            userImage: null,
            userBanner: null,
          });
          setLoading(false);
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

      const checkFollowStatus = async (userNum) => {
        try {
          const res = await checkFollowing(userNum);
          setIsFollowingUser(res.data.following || false);
        } catch (error) {
          console.error("팔로우 상태 확인 실패:", error);
          setIsFollowingUser(false);
        }
      };

      loadUserInfo();
    }
  }, [isVisible, nickname]);

  // 팔로우/언팔로우 토글
  const handleFollowToggle = async (e) => {
    e.stopPropagation();
    if (!userInfo?.userNum) return;

    setFollowLoading(true);
    try {
      if (isFollowingUser) {
        await unfollow(userInfo.userNum);
        setIsFollowingUser(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await follow(userInfo.userNum);
        setIsFollowingUser(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("팔로우 토글 실패:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const getProfileImage = () => {
    if (userInfo.userImage && userInfo.userImage.trim() !== "")
      return userInfo.userImage;
    return UserDefaultIcon;
  };

  const getBannerStyle = () => {
    if (userInfo.userBanner && userInfo.userBanner.trim() !== "") {
      return {
        backgroundImage: `url(${userInfo.userBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {
      backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    };
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    navigate(`/mypage/${nickname}`);
  };

  return (
    <>
      <div
        ref={popoverRef}
        className={`user-mini-popover ${isVisible ? "visible" : ""} ${showAbove ? "show-above" : ""}`}
        style={{
          top: showAbove ? 'auto' : position?.top || 0,
          bottom: showAbove ? `calc(100vh - ${position?.top}px + 30px)` : 'auto',
          left: position?.left || 0,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {loading ? (
          <div className="mini-popover-loading">로딩 중...</div>
        ) : (
          <>
            <div className="mini-popover-header">
              <div className="mini-header-bg" style={getBannerStyle()}></div>
              <img
                src={getProfileImage()}
                alt="프로필"
                className="mini-popover-avatar"
              />
            </div>

            <div className="mini-popover-content">
              <div className="mini-popover-name">
                {userInfo.userNickname || nickname}
              </div>

              <div className="mini-stats">
                <div className="mini-stat-item">
                  <span className="mini-stat-number">{postCount}</span>
                  <span className="mini-stat-label">게시글</span>
                </div>
                <div
                  className="mini-stat-item clickable"
                  ref={followersRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFollowPopoverTab('followers');
                    setShowFollowPopover(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="mini-stat-number">{followersCount}</span>
                  <span className="mini-stat-label">팔로워</span>
                </div>
                <div
                  className="mini-stat-item clickable"
                  ref={followingRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFollowPopoverTab('following');
                    setShowFollowPopover(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="mini-stat-number">{followingCount}</span>
                  <span className="mini-stat-label">팔로잉</span>
                </div>
              </div>

              {/* 팔로우 버튼 (다른 사용자일 때만 표시) */}
              {!isOwner && (
                <button
                  className={`mini-follow-btn ${isFollowingUser ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {isFollowingUser ? '팔로잉' : '팔로우'}
                </button>
              )}

              <button className="mini-view-profile-btn" onClick={handleProfileClick}>프로필 보기</button>
            </div>
          </>
        )}
      </div>

      {/* 팔로우 리스트 팝오버 - Portal로 렌더링 */}
      {showFollowPopover && userInfo.userNum && createPortal(
        <FollowListPopover
          userNum={userInfo.userNum}
          initialTab={followPopoverTab}
          onClose={() => setShowFollowPopover(false)}
          anchorEl={null}
        />,
        document.body
      )}
    </>
  );
};

export default UserMiniPopover;
