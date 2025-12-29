import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "./LoginPage.css"; 

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const GOOGLE_CLIENT_ID = "922053814206-nef3nk7celbbvkooeu6aeivo9f7753o1.apps.googleusercontent.com";
  const REDIRECT_URI = "http://localhost:5173/login"; 

  const [isIndividual, setIsIndividual] = useState(true);
  const [userId, setUserId] = useState(""); 
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const isRun = useRef(false);

  const getPreviousPage = useCallback(() => {
    const storedPath = sessionStorage.getItem("prevPage");
    if (storedPath) return storedPath;
    if (location.state && location.state.from) return location.state.from;
    return "/";
  }, [location.state]);

  // 1. 구글 로그인 처리 URL 수정
  const sendGoogleCodeToBackend = useCallback(async (authCode) => {
    try {
      // [수정] 경로 앞에 http://localhost:8080 추가 및 /api 확인
      const res = await fetch("http://localhost:8080/api/user/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === "NEW_USER") {
          navigate("/register", { 
            state: { email: json.email, name: json.name, provider: 'google' } 
          });
          sessionStorage.removeItem("prevPage");
        } else {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userId", json.user?.userId || json.userId);
          localStorage.setItem("userNickname", json.user?.userNickname || json.nickname);
          localStorage.setItem("userNum", json.user?.userNum || json.userNum);
          localStorage.setItem("role", json.role || "USER");
          localStorage.setItem("token", json.token); // JWT 토큰 저장

          // user 객체 저장
          if (json.user) {
            localStorage.setItem("user", JSON.stringify(json.user));
          }

          const targetPath = getPreviousPage();
          sessionStorage.removeItem("prevPage");
          navigate(targetPath);
        }
      } else {
        const text = await res.text();
        console.error("구글 로그인 실패 로그:", text);
        setLoginError("구글 로그인에 실패했습니다.");
      }
    } catch (e) {
      console.error("구글 로그인 오류:", e);
      setLoginError("서버 연결 실패");
    }
  }, [getPreviousPage, navigate]);

  // 2. 일반 로그인 처리 URL 수정
  async function handleLogin() {
    if (!userId || !password) {
      setLoginError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    const data = { userId, password, autoLogin };
    const loginType = isIndividual ? "USER" : "COMPANY";
    
    // [수정] 경로에 /api 추가: /user/login/proc -> /api/user/login/proc
    const endpoint = "http://localhost:8080/api/user/login/proc";

    try {
      const res = await fetch(`${endpoint}?type=${loginType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setLoginError("");
        const json = await res.json();
        const storage = autoLogin ? localStorage : sessionStorage;
        storage.setItem("isLoggedIn", "true");
        storage.setItem("role", json.role);
        storage.setItem("memberType", json.memberType);
        storage.setItem("userId", json.id);
        storage.setItem("userNickname", json.name);
        storage.setItem("userNum", json.num);
        storage.setItem("token", json.token); // JWT 토큰 저장

        // user 객체가 있으면 저장
        if (json.user) {
          storage.setItem("user", JSON.stringify(json.user));
        }

        const targetPath = location.state?.from || "/";
        navigate(targetPath);
      } else {
        setLoginError("아이디 혹은 비밀번호가 일치하지 않습니다.");
      }
    } catch (e) {
      console.error("일반 로그인 오류:", e);
      setLoginError("서버 연결에 실패했습니다.");
    }
  }

  const handleGoogleLogin = () => {
    sessionStorage.setItem("prevPage", location.state?.from || "/");
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile`;
    window.location.href = googleAuthUrl;
  };

  useEffect(() => {
    if (isRun.current) return;
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");
    if (authCode) {
      isRun.current = true;
      window.history.replaceState({}, null, window.location.pathname);
      setTimeout(() => {
        sendGoogleCodeToBackend(authCode);
      }, 0);
    }
  }, [sendGoogleCodeToBackend]);

  return (
    <div className="login-page-wrapper">
      <div className="login-box">
        <h2 className="login-title">로그인</h2>
        <div className="login-tabs">
          <div className={`tab-item ${isIndividual ? "active" : ""}`} onClick={() => { setIsIndividual(true); setLoginError(""); }}>개인회원</div>
          <div className={`tab-item ${!isIndividual ? "active" : ""}`} onClick={() => { setIsIndividual(false); setLoginError(""); }}>기업회원</div>
        </div>
        <div className="input-group">
          <input type="text" className="input-field" placeholder={isIndividual ? "아이디 입력" : "기업 아이디 입력"} value={userId} onChange={(e) => { setUserId(e.target.value); setLoginError(""); }} />
          <input type="password" className="input-field" placeholder="비밀번호 입력" value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(""); }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          {loginError && <span className="login-error-msg">{loginError}</span>}
        </div>
        <div className="options-row">
          <label><input type="checkbox" checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)} /> 로그인 상태 유지</label>
        </div>
        <button className="btn-login" onClick={handleLogin}>로그인</button>
        <div className="divider"><span>또는</span></div>
        <button className="btn-google" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          구글 계정으로 계속
        </button>
        <div className="bottom-links">
          <span onClick={() => navigate("/FindId")}>아이디 찾기</span> | <span onClick={() => navigate("/FindPassword")}>비밀번호 찾기</span> | <span onClick={() => navigate("/register")}>회원가입</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;