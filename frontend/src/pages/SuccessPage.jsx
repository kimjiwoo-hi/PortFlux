import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FindPage.css"; // 스타일 공유

function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};
  // 제목과 메시지 설정
  const title = state.title || "완료";
  const message = state.message || "작업이 완료되었습니다.";
  const data = state.data || null; 

  return (
    <div className="find-wrapper">
      <div className="find-box">

        {/* 제목 */}
        <h2 className="find-title">{title}</h2>

        <div className="form-container" style={{ alignItems: 'center' }}>

          {/* [추가] 성공 애니메이션 아이콘 */}
          <div className="success-icon-wrapper">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>

          {/* 메시지 */}
          <p className="success-message">
            {message.split('\n').map((line, i) => (
                <span key={i}>
                    {line}
                    <br />
                </span>
            ))}
          </p>

          {/* 데이터(아이디 등)가 있을 경우 표시 */}
          {data && (
            <div className="result-box">
              <div className="result-label">아이디</div>
              <div className="result-value">{data}</div>
            </div>
          )}

          {/* 버튼 그룹 */}
          <div className="btn-group-vertical">
            <button 
              className="btn-submit" 
              onClick={() => navigate("/login")}
            >
              로그인 하기
            </button>

            <button 
              className="btn-submit btn-outline" 
              onClick={() => navigate("/")}
            >
              홈으로 가기
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SuccessPage;