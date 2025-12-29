import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Header.css";
import PortFluxLogo from "../assets/PortFlux.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserProfilePopover from "./UserProfilePopover";
import UserDefaultIcon from "../assets/user_default_icon.png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(UserDefaultIcon);

  const popoverRef = useRef(null);
  const profileRef = useRef(null);

  const isLoggedIn = useMemo(() => {
    const localUser = localStorage.getItem("user");
    const sessionUser = sessionStorage.getItem("user");
    const localLogin = localStorage.getItem("isLoggedIn");
    const sessionLogin = sessionStorage.getItem("isLoggedIn");
    
    return !!localUser || !!sessionUser || localLogin === "true" || sessionLogin === "true";
  }, [location.pathname]);

  // 1. 페이지 이동 시 팝오버 닫기 (비동기 처리로 Cascading Render 방지)
  useEffect(() => {
    if (isPopoverOpen) {
      const timer = setTimeout(() => {
        setIsPopoverOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isPopoverOpen]);

  // 2. 사용자 프로필 이미지 불러오기
  useEffect(() => {
    const fetchUserProfileImage = async () => {
      const storage = localStorage.getItem("isLoggedIn") ? localStorage : sessionStorage;
      const storedUser = storage.getItem("user");
      let targetId = storage.getItem("userId");
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          targetId = user.userId;
        } catch {
          // err 변수 제거
          console.error("유저 정보 파싱 에러");
        }
      }

      if (targetId) {
        try {
          const response = await fetch(`/api/user/info/${targetId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.userImage && userProfileImage !== data.userImage) {
              setUserProfileImage(data.userImage);
            }
          }
        } catch (error) {
          console.error("프로필 이미지 로드 실패:", error);
        }
      }
    };

    if (isLoggedIn) {
      fetchUserProfileImage();
    } else if (userProfileImage !== UserDefaultIcon) {
      // 비동기 처리로 Cascading Render 방지
      const timer = setTimeout(() => {
        setUserProfileImage(UserDefaultIcon);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, userProfileImage]);

  const getLinkClass = (path) => {
    return location.pathname === path ? "link hoverable-link active" : "link hoverable-link";
  };

  const handleLinkClick = (path) => (e) => {
    if (location.pathname === path) {
      e.preventDefault();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsPopoverOpen(false);
    setUserProfileImage(UserDefaultIcon);
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setIsPopoverOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current?.contains(event.target)) return;
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
            <Link to="/"><img src={PortFluxLogo} alt="Logo" /></Link>
          </div>
          <div className="link-container">
            <Link to="/" onClick={handleLinkClick("/")}><div className={getLinkClass("/")}>둘러보기</div></Link>
            <Link to="/boardjob" onClick={handleLinkClick("/boardjob")}><div className={getLinkClass("/boardjob")}>채용</div></Link>
            <Link to="/boardfree" onClick={handleLinkClick("/boardfree")}><div className={getLinkClass("/boardfree")}>커뮤니티</div></Link>
          </div>
        </div>

        <div className="user">
          {!isLoggedIn ? (
            <>
              <Link to="/login" state={{ from: location.pathname }}><button className="login">로그인</button></Link>
              <Link to="/register"><button className="join">회원가입</button></Link>
            </>
          ) : (
            <div className="profile-container" ref={profileRef}>
              <img
                src={userProfileImage}
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