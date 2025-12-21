import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Header.css";
import PortFluxLogo from "../assets/PortFlux.png";
import { Link, useLocation, useNavigate } from "react-router-dom"; // useNavigate 추가
import UserProfilePopover from "./UserProfilePopover";
import UserDefaultIcon from "../assets/user_default_icon.png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 추가
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const popoverRef = useRef(null);
  const profileRef = useRef(null);

  // [추가] 로그인 상태를 useMemo로 계산 (localStorage/sessionStorage 읽기)
  const isLoggedIn = useMemo(() => {
    const localUser = localStorage.getItem("user");
    const sessionUser = sessionStorage.getItem("user");
    return !!localUser || !!sessionUser;
  }, [location.pathname]); // Re-check on path change

  // [추가] 페이지 이동 시 팝오버 닫기
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPopoverOpen(false);
  }, [location.pathname]);

  const getLinkClass = (path) => {
    let classes = "link hoverable-link";
    if (location.pathname === path) {
      classes += " active";
    }
    return classes;
  };

  const handleLinkClick = (path) => (e) => {
    // 현재 페이지와 같은 경로를 클릭한 경우 새로고침
    if (location.pathname === path) {
      e.preventDefault();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    // 로컬 스토리지 삭제
    localStorage.removeItem("user");
    // 세션 스토리지 삭제
    sessionStorage.removeItem("user");

    setIsPopoverOpen(false);

    // 홈으로 이동 후 페이지 새로고침
    navigate("/");
    window.location.reload(); // 상태 업데이트를 위해 페이지 새로고침
  };

  // ... (ESC 키, 외부 클릭 닫기 로직은 기존과 동일) ...
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setIsPopoverOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && profileRef.current.contains(event.target))
        return;
      if (
        isPopoverOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target)
      ) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPopoverOpen]);

  return (
    <>
      <div
        className={`overlay ${isPopoverOpen ? "active" : ""}`}
        onClick={() => setIsPopoverOpen(false)}
      ></div>
      <header className="header">
        <div className="logolink">
          <div className="header-logo">
            <Link to="/">
              <img src={PortFluxLogo} alt="PortFluxLogo.png" />
            </Link>
          </div>
          <div className="link-container">
            <Link to="/" onClick={handleLinkClick("/")}>
              <div className={getLinkClass("/")}>둘러보기</div>
            </Link>
            <Link to="/boardjob" onClick={handleLinkClick("/boardjob")}>
              <div className={getLinkClass("/boardjob")}>채용</div>
            </Link>
            <Link to="/boardfree" onClick={handleLinkClick("/boardfree")}>
              <div className={getLinkClass("/boardfree")}>커뮤니티</div>
            </Link>
            <Link to="/etc" onClick={handleLinkClick("/etc")}>
              <div className={getLinkClass("/etc")}>기타</div>
            </Link>
          </div>
        </div>

        <div className="user">
          {/* ▼▼▼ [핵심 변경] 로그인 상태에 따라 다른 UI 보여주기 ▼▼▼ */}
          {!isLoggedIn ? (
            // 1. 로그인이 안 된 경우: 로그인/회원가입 버튼 표시
            <>
              <Link to="/login" state={{ from: location.pathname }}>
                <button className="login">로그인</button>
              </Link>
              <Link to="/register">
                <button className="join">회원가입</button>
              </Link>
            </>
          ) : (
            // 2. 로그인이 된 경우: 프로필 아이콘만 표시
            <div className="profile-container" ref={profileRef}>
              <img
                src={UserDefaultIcon}
                alt="프로필"
                className="profile-pic"
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                style={{ cursor: "pointer" }} // 마우스 올리면 손가락 모양
              />
              <div ref={popoverRef}>
                {/* 팝오버에 로그아웃 함수 전달 */}
                <UserProfilePopover
                  isOpen={isPopoverOpen}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          )}
          {/* ▲▲▲ 변경 끝 ▲▲▲ */}
        </div>
      </header>
    </>
  );
};

export default Header;
