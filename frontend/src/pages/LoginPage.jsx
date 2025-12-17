import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "./LoginPage.css"; 

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 페이지 정보 가져오기 (이전 페이지 경로 확인용)

  // [설정] 구글 클라이언트 ID & 리다이렉트 URI
  const GOOGLE_CLIENT_ID = "922053814206-nef3nk7celbbvkooeu6aeivo9f7753o1.apps.googleusercontent.com";
  const REDIRECT_URI = "http://localhost:5173/login"; 

  // === 상태 변수 ===
  const [isIndividual, setIsIndividual] = useState(true);
  
  const [userId, setUserId] = useState(""); 
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);

  const [loginError, setLoginError] = useState("");
  const isRun = useRef(false);

  // ---------------------------------------------------------
  // [로직] 이전 페이지 경로 가져오기
  // ---------------------------------------------------------
  const getPreviousPage = () => {
    // 1순위: 구글 로그인 후 복귀했을 때 (sessionStorage에 저장된 값)
    const storedPath = sessionStorage.getItem("prevPage");
    if (storedPath) {
      return storedPath;
    }
    // 2순위: 일반적인 버튼 클릭으로 들어왔을 때 (navigate state로 넘어온 값)
    if (location.state && location.state.from) {
      return location.state.from;
    }
    // 3순위: 정보가 없으면 홈으로 이동
    return "/";
  };

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
        
        // 백엔드 응답(json)에 status, email, name이 포함되어 있다고 가정
        if (json.status === "NEW_USER") {
          // 신규 회원: 회원가입 페이지로 이동 (이메일, 이름 전달)
          navigate("/register", { 
            state: { 
              email: json.email, 
              name: json.name,
              provider: 'google' 
            } 
          });
          // 회원가입으로 가므로 이전 페이지 저장 기록은 삭제
          sessionStorage.removeItem("prevPage");

        } else {
          // 기존 회원: 로그인 성공
          console.log("구글 로그인 성공:", json);
          
          // ▼▼▼ [추가] 로그인 성공 상태 저장 (Header 감지용) + 닉네임 저장 ▼▼▼
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userId", json.email); // 구글은 이메일을 ID 대용으로 저장
          localStorage.setItem("userNickname", json.nickname); // 닉네임 저장
          // ▲▲▲ 추가 끝 ▲▲▲

          // 원래 있던 페이지로 이동
          const targetPath = getPreviousPage();
          sessionStorage.removeItem("prevPage"); // 사용했으니 삭제
          navigate(targetPath); 
        }
      } else {
        const text = await res.text();
        console.error("구글 로그인 실패 로그:", text);
        setLoginError("구글 로그인에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      setLoginError("서버 연결 실패");
    }
  }

  // [함수 2] 일반 로그인 핸들러 (아이디 로그인)
  async function handleLogin() {
    if (!userId || !password) {
      setLoginError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    const data = { userId, password, autoLogin };

    try {
      const res = await fetch("http://localhost:8080/user/login/proc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setLoginError("");
        const json = await res.json();
        console.log("로그인 성공:", json);
        
        // ▼▼▼ [수정] 로그인 유지 체크 여부에 따라 저장소 분기 + 닉네임 저장 ▼▼▼
        const storage = autoLogin ? localStorage : sessionStorage;
        storage.setItem("isLoggedIn", "true");
        storage.setItem("userId", userId);
        storage.setItem("userNickname", json.nickname); // 닉네임 저장
        // ▲▲▲ 수정 끝 ▲▲▲

        // 로그인 성공 시 이전 페이지로 이동
        const targetPath = location.state?.from || "/";
        navigate(targetPath);

      } else {
        setLoginError("아이디 혹은 비밀번호가 일치하지 않습니다.");
      }
    } catch (e) {
      console.error(e);
      setLoginError("서버 연결에 실패했습니다.");
    }
  }

  // [함수 3] 구글 로그인 버튼 핸들러
  const handleGoogleLogin = () => {
    // 구글 페이지로 이동하기 전에, 현재 돌아와야 할 페이지 위치를 저장해둠
    const fromPath = location.state?.from || "/";
    sessionStorage.setItem("prevPage", fromPath);

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile`;
    window.location.href = googleAuthUrl;
  };

  // ---------------------------------------------------------
  // useEffect 영역
  // ---------------------------------------------------------
  useEffect(() => {
    if (isRun.current) return;

    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");

    if (authCode) {
      isRun.current = true;
      // 주소창 정리
      window.history.replaceState({}, null, window.location.pathname);
      
      setTimeout(() => {
        sendGoogleCodeToBackend(authCode);
      }, 0);
    }
  }, []);

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
            onClick={() => { setIsIndividual(true); setLoginError(""); }}
          >
            개인회원
          </div>
          <div 
            className={`tab-item ${!isIndividual ? "active" : ""}`}
            onClick={() => { setIsIndividual(false); setLoginError(""); }}
          >
            기업회원
          </div>
        </div>

        {/* 입력창 */}
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder={isIndividual ? "아이디 입력" : "기업 아이디 입력"}
            value={userId}
            onChange={(e) => {
                setUserId(e.target.value);
                setLoginError(""); 
            }}
          />
          <input
            type="password"
            className="input-field"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => {
                setPassword(e.target.value);
                setLoginError(""); 
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
          />
          
          {/* 에러 메시지 출력 */}
          {loginError && (
            <span className="login-error-msg">{loginError}</span>
          )}
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
          <span onClick={() => navigate("/FindId")}>아이디 찾기</span> |
          <span onClick={() => navigate("/FindPassword")}>비밀번호 찾기</span> |
          <span onClick={() => navigate("/register")}>회원가입</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;