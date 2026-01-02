import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing, follow, unfollow, isFollowing as checkFollowing } from '../api/api';
import axios from 'axios';
import UserDefaultIcon from '../assets/user_default_icon.png';
import './FollowListPopover.css';

const FollowListPopover = ({ userNum, initialTab = 'followers', onClose, anchorEl }) => {
  const navigate = useNavigate();
  const popoverRef = useRef(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followStates, setFollowStates] = useState({});
  const [currentUserNum, setCurrentUserNum] = useState(null);

  useEffect(() => {
    const userNumStr = localStorage.getItem("userNum") || sessionStorage.getItem("userNum");
    setCurrentUserNum(userNumStr);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userNum) return;

      try {
        setLoading(true);
        const [followersRes, followingRes] = await Promise.all([
          getFollowers(userNum),
          getFollowing(userNum)
        ]);

        const followersList = followersRes.data.list || [];
        const followingList = followingRes.data.list || [];

        // 각 사용자 정보를 조회하여 보강
        const enrichedFollowers = await Promise.all(
          followersList.map(async (follow) => {
            try {
              // 게시글 목록에서 사용자 정보 추출
              const postsRes = await axios.get(
                `http://localhost:8080/api/boardlookup/user/${follow.followerId}/posts`,
                { withCredentials: true }
              );

              if (postsRes.data.length > 0) {
                const userPost = postsRes.data[0];
                return {
                  ...follow,
                  userNickname: userPost.userNickname,
                  userImage: userPost.userImageBase64
                    ? `data:image/jpeg;base64,${userPost.userImageBase64}`
                    : null
                };
              }
              return { ...follow, userNickname: null, userImage: null };
            } catch (error) {
              console.error(`사용자 ${follow.followerId} 정보 조회 실패:`, error);
              return { ...follow, userNickname: null, userImage: null };
            }
          })
        );

        const enrichedFollowing = await Promise.all(
          followingList.map(async (follow) => {
            try {
              const postsRes = await axios.get(
                `http://localhost:8080/api/boardlookup/user/${follow.followingId}/posts`,
                { withCredentials: true }
              );

              if (postsRes.data.length > 0) {
                const userPost = postsRes.data[0];
                return {
                  ...follow,
                  userNickname: userPost.userNickname,
                  userImage: userPost.userImageBase64
                    ? `data:image/jpeg;base64,${userPost.userImageBase64}`
                    : null
                };
              }
              return { ...follow, userNickname: null, userImage: null };
            } catch (error) {
              console.error(`사용자 ${follow.followingId} 정보 조회 실패:`, error);
              return { ...follow, userNickname: null, userImage: null };
            }
          })
        );

        setFollowers(enrichedFollowers);
        setFollowing(enrichedFollowing);

        // 각 사용자에 대한 팔로우 상태 확인
        if (currentUserNum) {
          const states = {};
          const allUsers = [
            ...followersList.map(f => f.followerId),
            ...followingList.map(f => f.followingId)
          ];
          const uniqueUsers = [...new Set(allUsers)];

          for (const userId of uniqueUsers) {
            if (String(userId) !== String(currentUserNum)) {
              try {
                const res = await checkFollowing(userId);
                states[userId] = res.data.following || false;
              } catch (error) {
                states[userId] = false;
              }
            }
          }
          setFollowStates(states);
        }
      } catch (error) {
        console.error("팔로우 데이터 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userNum, currentUserNum]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 팝오버 내부 클릭인지 확인
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        // anchorEl이 없거나 anchorEl 외부 클릭인 경우에만 닫기
        if (!anchorEl || !anchorEl.contains(event.target)) {
          onClose();
        }
      }
    };

    // 약간의 지연을 두고 이벤트 리스너 등록 (팝오버가 열릴 때의 클릭 이벤트와 겹치지 않도록)
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, anchorEl]);

  const handleFollow = async (targetUserNum) => {
    try {
      await follow(targetUserNum);
      setFollowStates(prev => ({ ...prev, [targetUserNum]: true }));
    } catch (error) {
      console.error("팔로우 실패:", error);
    }
  };

  const handleUnfollow = async (targetUserNum) => {
    try {
      await unfollow(targetUserNum);
      setFollowStates(prev => ({ ...prev, [targetUserNum]: false }));
    } catch (error) {
      console.error("언팔로우 실패:", error);
    }
  };

  const handleUserClick = (userNickname) => {
    onClose();
    if (userNickname) {
      navigate(`/mypage/${userNickname}`);
    }
  };

  const renderUserList = (users, isFollowerTab) => {
    if (loading) {
      return <div className="follow-popover-loading">로딩 중...</div>;
    }

    if (!users || users.length === 0) {
      return (
        <div className="follow-popover-empty">
          {isFollowerTab ? '팔로워가 없습니다.' : '팔로잉한 사용자가 없습니다.'}
        </div>
      );
    }

    return users.map((user) => {
      const targetUserNum = isFollowerTab ? user.followerId : user.followingId;
      const targetUserNickname = user.userNickname;
      const isCurrentUser = String(targetUserNum) === String(currentUserNum);
      const isFollowingThis = followStates[targetUserNum] || false;

      return (
        <div key={user.followId} className="follow-popover-user-item">
          <div
            className="follow-popover-user-info"
            onClick={(e) => {
              e.stopPropagation();
              if (targetUserNickname) {
                handleUserClick(targetUserNickname);
              }
            }}
            style={{ cursor: targetUserNickname ? 'pointer' : 'default' }}
          >
            <img
              src={user.userImage || UserDefaultIcon}
              alt="프로필"
              className="follow-popover-avatar"
              onError={(e) => { e.target.src = UserDefaultIcon; }}
            />
            <div className="follow-popover-user-details">
              <span className="follow-popover-nickname">
                {targetUserNickname || `User #${targetUserNum}`}
              </span>
            </div>
          </div>
          {!isCurrentUser && (
            <button
              className={`follow-popover-btn ${isFollowingThis ? 'following' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                isFollowingThis ? handleUnfollow(targetUserNum) : handleFollow(targetUserNum);
              }}
            >
              {isFollowingThis ? '팔로잉' : '팔로우'}
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="follow-popover-overlay" onClick={onClose}>
      <div className="follow-popover" ref={popoverRef} onClick={(e) => e.stopPropagation()}>
        <div className="follow-popover-header">
          <div className="follow-popover-tabs">
            <button
              className={`follow-popover-tab ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              팔로워 {followers.length}
            </button>
            <button
              className={`follow-popover-tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              팔로잉 {following.length}
            </button>
          </div>
          <button className="follow-popover-close" onClick={onClose}>×</button>
        </div>
        <div className="follow-popover-content">
          {activeTab === 'followers'
            ? renderUserList(followers, true)
            : renderUserList(following, false)
          }
        </div>
      </div>
    </div>
  );
};

export default FollowListPopover;
