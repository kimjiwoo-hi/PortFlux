import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import "./LoginPage.css"; 

function LoginPage() {
  // 1. 페이지 이동을 위한 훅 (반드시 컴포넌트 최상단에 있어야 함)
  const navigate = useNavigate();

  // [설정] 구글 클라이언트 ID
  const GOOGLE_CLIENT_ID = "922053814206-nef3nk7celbbvkooeu6aeivo9f7753o1.apps.googleusercontent.com";
  // [설정] 리다이렉트 URI
  const REDIRECT_URI = "http://localhost:5173/login"; 

  // 상태 변수들
  const [isIndividual, setIsIndividual] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);

  // 중복 실행 방지용
  const isRun = useRef(false);

  // ---------------------------------------------------------
  // 함수 정의 영역
  // ---------------------------------------------------------

  // [함수 1] 구글 인증 코드를 백엔드로 전송
  async function sendGoogleCodeToBackend(authCode) {
    try {
      const res = await fetch("http://localhost:8080/user/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode }),
      });

      if (res.ok) {
        const json = await res.json();
        
        if (json.status === "NEW_USER") {
          alert("회원가입이 필요합니다. 회원가입 페이지로 이동합니다.");
          navigate("/register"); // 회원가입 페이지로 이동
        } else {
          alert(`구글 로그인 성공! ${json.userNickname}님 환영합니다.`);
          console.log("유저 정보:", json);
          // navigate("/"); // 메인으로 이동 (필요 시 주석 해제)
        }
      } else {
        const text = await res.text();
        console.error("구글 로그인 실패 로그:", text);
      }
    } catch (e) {
      console.error(e);
      alert("서버 연결 실패");
    }
  }

  // [함수 2] 일반 로그인 핸들러
  async function handleLogin() {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    const data = { email, password, autoLogin };

    try {
      const res = await fetch("http://localhost:8080/user/login/proc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        alert(`로그인 성공! ${json.userNickname}님 환영합니다.`);
        // navigate("/"); // 메인으로 이동 (필요 시 주석 해제)
      } else {
        alert("로그인 실패: 정보를 확인해주세요.");
      }
    } catch (e) {
      console.error(e);
      alert("서버 연결 실패");
    }
  }

  // [함수 3] 구글 로그인 버튼 핸들러
  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile`;
    window.location.href = googleAuthUrl;
  };

  // ---------------------------------------------------------
  // useEffect 영역
  // ---------------------------------------------------------

  useEffect(() => {
    // 중복 실행 방지
    if (isRun.current) return;

    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");

    if (authCode) {
      isRun.current = true;
      console.log("구글 인증 코드 감지됨:", authCode);
      
      // 주소창에서 ?code=... 제거 (깔끔하게)
      window.history.replaceState({}, null, window.location.pathname);
      
      sendGoogleCodeToBackend(authCode);
    }
  }, []); // 빈 배열: 페이지 로드 시 1회만 실행

  // ---------------------------------------------------------
  // 렌더링(HTML) 영역
  // ---------------------------------------------------------
  return (
    <div className="login-page-wrapper">
      <div className="login-box">
        <h2 className="login-title">로그인</h2>

        {/* 탭 */}
        <div className="login-tabs">
          <div 
            className={`tab-item ${isIndividual ? "active" : ""}`}
            onClick={() => setIsIndividual(true)}
          >
            개인회원
          </div>
          <div 
            className={`tab-item ${!isIndividual ? "active" : ""}`}
            onClick={() => setIsIndividual(false)}
          >
            기업회원
          </div>
        </div>

        {/* 입력창 */}
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder={isIndividual ? "이메일 입력" : "기업 이메일 입력"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
          />
        </div>

        {/* 옵션 */}
        <div className="options-row">
          <label>
            <input 
              type="checkbox" 
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
            />
            로그인 상태 유지
          </label>
        </div>

        {/* 일반 로그인 버튼 */}
        <button className="btn-login" onClick={handleLogin}>
          로그인
        </button>

        {/* 구분선 */}
        <div className="divider">
          <span>또는</span>
        </div>

        {/* 구글 로그인 버튼 */}
        <button className="btn-google" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          구글 계정으로 계속
        </button>

        {/* 하단 링크 */}
        <div className="bottom-links">
          <span>아이디 찾기</span> |
          <span>비밀번호 찾기</span> |
          <span onClick={() => navigate("/register")}>회원가입</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;