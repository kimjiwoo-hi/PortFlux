import React from "react";
import "./Header.css";
import PortFluxLogo from "../assets/PortFlux.png";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <div className="logolink">
        <div className="header-logo">
          <Link to="/">
            <img src={PortFluxLogo} alt="PortFluxLogo.png" />
          </Link>
        </div>
        <div className="link">
          <Link to="/boardlookup">
            <div className="link">둘러보기</div>
          </Link>
          <Link to="/boardjob">
            <div className="link">채용</div>
          </Link>
          <Link to="/boardfree">
            <div className="link">커뮤니티</div>
          </Link>
          <Link to="">
            <div className="link">기타</div>
          </Link>
        </div>
      </div>
      <div className="user">
        <Link>
          <button className="login">로그인</button>
        </Link>
        <Link>
          <button className="join">회원가입</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
