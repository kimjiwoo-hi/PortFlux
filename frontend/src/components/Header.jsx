import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Header.css";
import PortFluxLogo from "../assets/PortFlux.png";
import { Link, useLocation, useNavigate } from "react-router-dom"; // useLocation 추가
import UserProfilePopover from "./UserProfilePopover";
import UserDefaultIcon from "../assets/user_default_icon.png";

const Header = () => {
  const location = useLocation(); // 현재 위치 파악
  const navigate = useNavigate();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const popoverRef = useRef(null);
  const profileRef = useRef(null);

  // 로그인 상태 계산 (로컬 또는 세션 스토리지 확인)
  const isLoggedIn = useMemo(() => {
    const localLogin = localStorage.getItem("isLoggedIn");
    const sessionLogin = sessionStorage.getItem("isLoggedIn");
    return localLogin === "true" || sessionLogin === "true";
  }, [location.pathname]);

  // 페이지 이동 시 팝오버 닫기
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPopoverOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const getLinkClass = (path) => {
    let classes = "link hoverable-link";
    if (location.pathname === path) {
      classes += " active";
    }
    return classes;
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userNickname");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userNickname");

    setIsPopoverOpen(false);
    navigate("/");
  };

  // ESC 키 및 외부 클릭 처리 등 기존 로직 유지...
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setIsPopoverOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && profileRef.current.contains(event.target)) return;
      if (isPopoverOpen && popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPopoverOpen]);

  return (
    <>
      <div className={`overlay ${isPopoverOpen ? "active" : ""}`} onClick={() => setIsPopoverOpen(false)}></div>
      <header className="header">
        <div className="logolink">
          <div className="header-logo">
            <Link to="/">
              <img src={PortFluxLogo} alt="PortFluxLogo.png" />
            </Link>
          </div>
          <div className="link-container">
            <Link to="/"><div className={getLinkClass("/")}>둘러보기</div></Link>
            <Link to="/boardjob"><div className={getLinkClass("/boardjob")}>채용</div></Link>
            <Link to="/boardfree"><div className={getLinkClass("/boardfree")}>커뮤니티</div></Link>
            <Link to="/etc"><div className={getLinkClass("/etc")}>기타</div></Link>
          </div>
        </div>

        <div className="user">
          {!isLoggedIn ? (
            <>
              {/* [수정] state에 현재 경로(location.pathname)를 담아서 보냄 */}
              <Link to="/login" state={{ from: location.pathname }}>
                <button className="login">로그인</button>
              </Link>
              <Link to="/register">
                <button className="join">회원가입</button>
              </Link>
            </>
          ) : (
            <div className="profile-container" ref={profileRef}>
              <img
                src={UserDefaultIcon}
                alt="프로필"
                className="profile-pic"
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                style={{ cursor: "pointer" }}
              />
              <div ref={popoverRef}>
                <UserProfilePopover isOpen={isPopoverOpen} onLogout={handleLogout} />
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;