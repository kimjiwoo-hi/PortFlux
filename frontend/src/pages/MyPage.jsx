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
            <span className="nav-icon">•</span>
            작성한 게시글
          </NavLink>
          <NavLink
            to="/mypage/mycomments"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">•</span>
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
