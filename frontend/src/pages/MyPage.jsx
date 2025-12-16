import { Outlet, NavLink, useLocation } from "react-router-dom";
import "./MyPage.css";

function MyPage() {
  const location = useLocation();

  // /mypage로만 접근했을 때는 내 정보로 리다이렉트
  const isRootMyPage = location.pathname === "/mypage";

  return (
    <div className="mypage-container">
      {/* 좌측 사이드바 */}
      <aside className="mypage-sidebar">
        <h2 className="sidebar-title">마이페이지</h2>
        <nav className="sidebar-nav">
          <NavLink
            to="/mypage/myinfo"
            className={({ isActive }) =>
              isActive || isRootMyPage ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">👤</span>내 정보
          </NavLink>
          <NavLink
            to="/mypage/myposts"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">📝</span>
            작성한 게시글
          </NavLink>
          <NavLink
            to="/mypage/mycomments"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">💬</span>
            작성한 댓글
          </NavLink>
          <NavLink
            to="/mypage/savedposts"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">⭐</span>
            저장한 게시글
          </NavLink>
        </nav>
      </aside>

      {/* 우측 컨텐츠 영역 */}
      <main className="mypage-content">
        <Outlet />
      </main>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { getFollowing, getFollowers, follow, unfollow } from "../api/api";
import "./FollowPage.css";

const MyPage = () => {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activeTab, setActiveTab] = useState("following");
  const currentUserId = 1; // Hardcoded for now

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "following") {
        const followingData = await getFollowing(currentUserId);
        setFollowing(followingData.data);
      } else {
        const followersData = await getFollowers(currentUserId);
        setFollowers(followersData.data);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleFollow = async (userIdToFollow) => {
    await follow(currentUserId, userIdToFollow);
    // Refresh list
    const followingData = await getFollowing(currentUserId);
    setFollowing(followingData.data);
  };

  const handleUnfollow = async (userIdToUnfollow) => {
    await unfollow(currentUserId, userIdToUnfollow);
    // Refresh list
    const followingData = await getFollowing(currentUserId);
    setFollowing(followingData.data);
  };

  const UserList = ({ users, onFollow, onUnfollow, isFollowingList }) => (
    <ul>
      {users.map((user) => (
        <li key={user}>
          User ID: {user}
          {isFollowingList ? (
            <button onClick={() => onUnfollow(user)}>Unfollow</button>
          ) : (
            <button onClick={() => onFollow(user)}>Follow</button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="follow-page">
      <div className="tabs">
        <button
          onClick={() => setActiveTab("following")}
          className={activeTab === "following" ? "active" : ""}
        >
          Following
        </button>
        <button
          onClick={() => setActiveTab("followers")}
          className={activeTab === "followers" ? "active" : ""}
        >
          Followers
        </button>
      </div>
      <div className="content">
        {activeTab === "following" ? (
          <UserList
            users={following}
            onUnfollow={handleUnfollow}
            isFollowingList={true}
          />
        ) : (
          <UserList
            users={followers}
            onFollow={handleFollow}
            isFollowingList={false}
          />
        )}
      </div>
    </div>
  );
};
import { Outlet, NavLink, useLocation } from "react-router-dom";
import "./MyPage.css";

function MyPage() {
  const location = useLocation();

  // /mypage로만 접근했을 때는 내 정보로 리다이렉트
  const isRootMyPage = location.pathname === "/mypage";

  return (
    <div className="mypage-container">
      {/* 좌측 사이드바 */}
      <aside className="mypage-sidebar">
        <h2 className="sidebar-title">마이페이지</h2>
        <nav className="sidebar-nav">
          <NavLink
            to="/mypage/myinfo"
            className={({ isActive }) =>
              isActive || isRootMyPage ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">👤</span>내 정보
          </NavLink>
          <NavLink
            to="/mypage/myposts"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">📝</span>
            작성한 게시글
          </NavLink>
          <NavLink
            to="/mypage/mycomments"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">💬</span>
            작성한 댓글
          </NavLink>
          <NavLink
            to="/mypage/savedposts"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">⭐</span>
            저장한 게시글
          </NavLink>
        </nav>
      </aside>

      {/* 우측 컨텐츠 영역 */}
      <main className="mypage-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MyPage;
