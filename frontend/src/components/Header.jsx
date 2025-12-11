import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import PortFluxLogo from "../assets/PortFlux.png";
import { Link, useLocation } from "react-router-dom";
import UserProfilePopover from "./UserProfilePopover";
import UserDefaultIcon from "../assets/user_default_icon.png"

const Header = () => {
  const location = useLocation();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef(null);
  const profileRef = useRef(null);

  const getLinkClass = (path) => {
    let classes = "link hoverable-link";
    if (location.pathname === path) {
      classes += " active";
    }
    return classes;
  };

  const handleLogout = () => {
    // For now, just closes the popover as we don't handle login state
    setIsPopoverOpen(false);
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsPopoverOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is on the profile pic, the toggle will handle it.
      if (profileRef.current && profileRef.current.contains(event.target)) {
        return;
      }
      // If the popover is open and the click is outside, close it.
      if (
        isPopoverOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target)
      ) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  return (
    <>
      <div className={`overlay ${isPopoverOpen ? 'active' : ''}`} onClick={() => setIsPopoverOpen(false)}></div>
      <header className="header">
        <div className="logolink">
          <div className="header-logo">
            <Link to="/boardlookup">
              <img src={PortFluxLogo} alt="PortFluxLogo.png" />
            </Link>
          </div>
          <div className="link-container">
            <Link to="/boardlookup">
              <div className={getLinkClass("/boardlookup")}>둘러보기</div>
            </Link>
            <Link to="/boardjob">
              <div className={getLinkClass("/boardjob")}>채용</div>
            </Link>
            <Link to="/boardfree">
              <div className={getLinkClass("/boardfree")}>커뮤니티</div>
            </Link>
            <Link to="/etc">
              <div className={getLinkClass("/etc")}>기타</div>
            </Link>
          </div>
        </div>
        <div className="user">
          <Link to="/login">
            <button className="login">로그인</button>
          </Link>
          <Link to="/join">
            <button className="join">회원가입</button>
          </Link>
          <div className="profile-container" ref={profileRef}>
            <img 
                src={UserDefaultIcon} 
                alt="프로필" 
                className="profile-pic"
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            />
            <div ref={popoverRef}>
              <UserProfilePopover isOpen={isPopoverOpen} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
