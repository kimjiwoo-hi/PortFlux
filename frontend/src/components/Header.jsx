import React from "react";
import "./Header.css";
import PortFluxLogo from "../assets/PortFlux.png";
// ★ [수정] useLocation 추가
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  // ★ [추가] 현재 사용자가 보고 있는 페이지의 경로를 알아내기 위한 훅
  const location = useLocation();

  return (
    <header className="header">
      <div className="logolink">
        <div className="header-logo">
          {/* 로고 클릭 시 메인('/')으로 이동 */}
          <Link to="/">
            <img src={PortFluxLogo} alt="PortFluxLogo.png" />
          </Link>
        </div>
        <div className="link">
          {/* main.jsx의 "boardlookup"과 연결 */}
          <Link to="/boardlookup">
            <div className="link">둘러보기</div>
          </Link>

          {/* main.jsx의 "boardjob"과 연결 */}
          <Link to="/boardjob">
            <div className="link">채용</div>
          </Link>

          {/* main.jsx의 "boardfree"와 연결 */}
          <Link to="/boardfree">
            <div className="link">커뮤니티</div>
          </Link>

          {/* "기타"는 main.jsx에 경로가 없어서 일단 '#'이나 빈 곳으로 둡니다 */}
          <Link to="#">
            <div className="link">기타</div>
          </Link>
        </div>
      </div>

      <div className="user">
        {/* ★ [수정] 로그인 버튼 클릭 시 현재 위치(pathname)를 함께 전달 */}
        {/* state={{ from: location.pathname }} 부분이 핵심입니다 */}
        <Link to="/login" state={{ from: location.pathname }}>
          <button className="login">로그인</button>
        </Link>

        {/* main.jsx의 "register"와 연결 */}
        <Link to="/register">
          <button className="join">회원가입</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;