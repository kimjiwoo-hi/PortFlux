import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing, follow, unfollow, isFollowing as checkFollowing } from '../api/api';
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

        setFollowers(followersList);
        setFollowing(followingList);

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
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        if (anchorEl && !anchorEl.contains(event.target)) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleUserClick = (userId, userNickname) => {
    onClose();
    if (userNickname) {
      navigate(`/mypage/${userNickname}`);
    } else {
      navigate(`/user/${userId}`);
    }
  };

  const getUserImageSrc = (user) => {
    if (user.userImageBase64) {
      return `data:image/jpeg;base64,${user.userImageBase64}`;
    }
    if (user.userImage) {
      return user.userImage;
    }
    return UserDefaultIcon;
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
      const targetUserNickname = isFollowerTab ? user.followerNickname : user.followingNickname;
      const isCurrentUser = String(targetUserNum) === String(currentUserNum);
      const isFollowingThis = followStates[targetUserNum] || false;

      return (
        <div key={user.followId} className="follow-popover-user-item">
          <div
            className="follow-popover-user-info"
            onClick={() => handleUserClick(targetUserNum, targetUserNickname)}
          >
            <img
              src={getUserImageSrc(user)}
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
              onClick={() => isFollowingThis ? handleUnfollow(targetUserNum) : handleFollow(targetUserNum)}
            >
              {isFollowingThis ? '팔로잉' : '팔로우'}
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="follow-popover-overlay">
      <div className="follow-popover" ref={popoverRef}>
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
