import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Header.css";
import PortFluxLogo from "../assets/PortFlux.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserProfilePopover from "./UserProfilePopover";
import UserDefaultIcon from "../assets/user_default_icon.png";
import { fetchUserInfo, getCachedUserInfo, invalidateUserInfoCache } from "../utils/userInfoCache";

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

  // 1. 페이지 이동 시 팝오버 닫기
  useEffect(() => {
    setIsPopoverOpen(false);
  }, [location.pathname]);

  // 2. 사용자 프로필 이미지 불러오기 (캐시 사용)
  useEffect(() => {
    const loadUserProfileImage = async () => {
      // 먼저 캐시 확인
      const cachedInfo = getCachedUserInfo();
      if (cachedInfo) {
        const newImage = cachedInfo.userImage || UserDefaultIcon;
        if (userProfileImage !== newImage) {
          setUserProfileImage(newImage);
        }
        return;
      }

      // 캐시에 없으면 API 호출
      try {
        const userInfo = await fetchUserInfo();
        const newImage = userInfo.userImage || UserDefaultIcon;
        if (userProfileImage !== newImage) {
          setUserProfileImage(newImage);
        }
      } catch (error) {
        console.error("프로필 이미지 로드 실패:", error);
        if (userProfileImage !== UserDefaultIcon) {
          setUserProfileImage(UserDefaultIcon);
        }
      }
    };

    if (isLoggedIn) {
      loadUserProfileImage();
    } else {
      if (userProfileImage !== UserDefaultIcon) {
        setUserProfileImage(UserDefaultIcon);
      }
    }
  }, [isLoggedIn]);

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
    invalidateUserInfoCache(); // 캐시 무효화
    setIsPopoverOpen(false);
    setUserProfileImage(UserDefaultIcon);
    navigate("/");
    window.location.reload();
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setIsPopoverOpen(!isPopoverOpen);
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
                onClick={handleProfileClick}
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
