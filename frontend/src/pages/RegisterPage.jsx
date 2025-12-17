import { useState, useEffect } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();

  // =================================================================
  // 1. 상태 변수 선언 (기존 코드 유지)
  // =================================================================
  const [isIndividual, setIsIndividual] = useState(true);

  // === 입력값 상태 ===
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [userName, setUserName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");

  // === 유효성 검사 상태 ===
  const [isBizNumValid, setIsBizNumValid] = useState(null);
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [emailMsg, setEmailMsg] = useState("");
  const [isPwdValid, setIsPwdValid] = useState(null);
  const [isPwdMatch, setIsPwdMatch] = useState(null);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  // =================================================================
  // 2. 정규식 및 초기화 (기존 코드 유지)
  // =================================================================
  const idRegex = /^[a-z0-9]{4,12}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  const resetForm = () => {
    setUserId("");
    setIsIdAvailable(null);
    setEmail("");
    setEmailMsg("");
    setAuthCode("");
    setPassword("");
    setPasswordCheck("");
    setUserName("");
    setNickname("");
    setPhoneNumber("");
    setBusinessNumber("");
    setIsBizNumValid(null);
    setIsEmailValid(null);
    setIsPwdValid(null);
    setIsPwdMatch(null);
    setIsNicknameAvailable(null);
    setIsAuthVerified(false);
  };

  // =================================================================
  // 3. 핸들러 함수들 (기존 코드 유지)
  // =================================================================
=======
import { useNavigate, useLocation } from "react-router-dom"; 
import "./RegisterPage.css";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};
  const googleEmail = state.email || ""; 
  const googleName = state.name || "";   
  const isGoogle = state.provider === 'google'; 

  const [isIndividual, setIsIndividual] = useState(true);
  const [userId, setUserId] = useState("");
  
  // 이메일 상태 (초기값 설정)
  const [email, setEmail] = useState(googleEmail);
  const [userName, setUserName] = useState(googleName); 
  
  const [authCode, setAuthCode] = useState(""); 
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [nickname, setNickname] = useState(""); 
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");

  const [isBizNumValid, setIsBizNumValid] = useState(null); 
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  
  const [isEmailValid, setIsEmailValid] = useState(isGoogle ? true : null);
  const [emailMsg, setEmailMsg] = useState(isGoogle ? "구글 계정 이메일이 자동 입력되었습니다" : ""); 
  
  const [isPwdValid, setIsPwdValid] = useState(null);
  const [isPwdMatch, setIsPwdMatch] = useState(null);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(null);
  const [isAuthVerified, setIsAuthVerified] = useState(isGoogle); 

  // 휴대전화 유효성 상태
  const [isPhoneValid, setIsPhoneValid] = useState(null);

  // 인증 완료 메시지
  const [codeMsg, setCodeMsg] = useState(""); 
  
  // 정규식 정의
  const idRegex = /^[a-z0-9]{4,12}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  const phoneRegex = /^010-\d{4}-\d{4}$/;

  // 탭 전환 시 초기화 함수
  const resetForm = () => {
    setUserId(""); 
    setIsIdAvailable(null);
    
    // 구글 로그인이면 정보 유지
    setEmail(isGoogle ? googleEmail : ""); 
    setUserName(isGoogle ? googleName : "");
    setEmailMsg(isGoogle ? "구글 계정 이메일이 자동 입력되었습니다" : "");
    setIsAuthVerified(isGoogle);
    setIsEmailValid(isGoogle ? true : null);

    setAuthCode("");
    setPassword(""); 
    setPasswordCheck("");
    setNickname(""); 
    setPhoneNumber(""); 
    setBusinessNumber("");
    setIsBizNumValid(null);
    setIsPwdValid(null);
    setIsPwdMatch(null);
    setIsNicknameAvailable(null);
    setCodeMsg(""); 
    setIsPhoneValid(null);
  };

>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
  const handleIdChange = (e) => {
    setUserId(e.target.value);
    setIsIdAvailable(null);
  };

  const handleCheckId = async () => {
<<<<<<< HEAD
    if (!userId) {
      alert("아이디를 입력해 주세요.");
      return;
    }
    if (!idRegex.test(userId)) {
      alert("아이디는 영문 소문자/숫자 4~12자여야 합니다.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/user/register/check-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId }),
=======
    if (!userId) return; 
    if (!idRegex.test(userId)) return;
    try {
      const res = await fetch("http://localhost:8080/user/register/check-id", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userId }),
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
      });
      if (res.ok) {
        const isDuplicate = await res.json();
        if (isDuplicate) setIsIdAvailable(false);
        else setIsIdAvailable(true);
<<<<<<< HEAD
      } else alert("중복 확인 오류가 발생했습니다.");
    } catch {
      alert("서버 연결 실패");
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setIsAuthVerified(false);
    if (val.length === 0) {
      setIsEmailValid(null);
      setEmailMsg("");
      return;
    }
    if (!emailRegex.test(val)) {
      setIsEmailValid(false);
      setEmailMsg("이메일 형식이 올바르지 않습니다.");
    } else {
      setIsEmailValid(null);
      setEmailMsg("");
    }
  };

  useEffect(() => {
    if (!email || !emailRegex.test(email)) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/user/register/check-email",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email }),
          }
        );
        if (res.ok) {
          const isDuplicate = await res.json();
          if (isDuplicate) {
            setIsEmailValid(false);
            setEmailMsg("이미 사용중인 이메일입니다.");
          } else {
            setIsEmailValid(true);
            setEmailMsg("사용 가능한 이메일입니다.");
          }
        }
      } catch (e) {
        console.error("이메일 중복 확인 에러", e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [email]);
=======
      }
    } catch { console.error("서버 오류"); }
  };

  const handleEmailChange = (e) => {
    if (isGoogle) return; 
    const val = e.target.value;
    setEmail(val);
    
    setIsAuthVerified(false);
    setCodeMsg(""); 
    
    if (val.length === 0) { setIsEmailValid(null); setEmailMsg(""); return; }
    if (!emailRegex.test(val)) { setIsEmailValid(false); setEmailMsg("이메일 형식이 올바르지 않습니다"); } 
    else { setIsEmailValid(null); setEmailMsg(""); }
  };

  useEffect(() => {
    if (isGoogle) return;
    if (!email || !emailRegex.test(email)) return;
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:8080/user/register/check-email", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }),
        });
        if (res.ok) {
          const isDuplicate = await res.json();
          if (isDuplicate) { 
             setIsEmailValid(false); 
             setEmailMsg("이미 사용중인 이메일입니다"); 
          } else { 
             setIsEmailValid(true); 
             setEmailMsg("사용 가능한 이메일입니다"); 
          }
        }
      } catch (e) { console.error(e); }
    }, 500);
    return () => clearTimeout(timer); 
  }, [email, isGoogle]); 
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (val.length === 0) setIsPwdValid(null);
    else setIsPwdValid(passwordRegex.test(val));
    if (passwordCheck.length > 0) setIsPwdMatch(val === passwordCheck);
  };

  const handlePasswordCheckChange = (e) => {
    const val = e.target.value;
    setPasswordCheck(val);
    if (val.length === 0) setIsPwdMatch(null);
    else setIsPwdMatch(val === password);
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setIsNicknameAvailable(null);
  };

  const handleCheckNickname = async () => {
<<<<<<< HEAD
    if (!nickname) {
      alert("닉네임을 입력해 주세요.");
      return;
    }
    try {
      const res = await fetch(
        "http://localhost:8080/user/register/check-nickname",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname }),
        }
      );
      if (res.ok) {
        const isAvailable = await res.json();
        setIsNicknameAvailable(isAvailable);
      } else alert("중복 확인 오류");
    } catch {
      alert("서버 연결 실패");
    }
  };

  const handlePhoneNumberChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    let formattedValue = "";
    if (rawValue.length <= 3) formattedValue = rawValue;
    else if (rawValue.length <= 7)
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    else
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(
        3,
        7
      )}-${rawValue.slice(7, 11)}`;
    setPhoneNumber(formattedValue);
  };

  const handleBusinessNumberChange = async (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    let formattedValue = "";
    if (rawValue.length <= 3) formattedValue = rawValue;
    else if (rawValue.length <= 5)
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    else if (rawValue.length < 10)
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(
        3,
        5
      )}-${rawValue.slice(5)}`;
    else
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(
        3,
        5
      )}-${rawValue.slice(5, 10)}`;
=======
    if (!nickname) return;
    try {
      const res = await fetch("http://localhost:8080/user/register/check-nickname", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname }),
      });
      if (res.ok) {
          const isAvailable = await res.json();
          setIsNicknameAvailable(isAvailable);
      }
    } catch { console.error("서버 오류"); }
  };

  const handlePhoneNumberChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, ""); 
    let formattedValue = "";
    if (rawValue.length <= 3) formattedValue = rawValue;
    else if (rawValue.length <= 7) formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    else formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
    
    setPhoneNumber(formattedValue);

    if (phoneRegex.test(formattedValue)) {
      setIsPhoneValid(true);
    } else if (formattedValue.length > 0) {
      setIsPhoneValid(false);
    } else {
      setIsPhoneValid(null);
    }
  };

  const handleBusinessNumberChange = async (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, ""); 
    let formattedValue = "";
    if (rawValue.length <= 3) formattedValue = rawValue;
    else if (rawValue.length <= 5) formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    else if (rawValue.length < 10) formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 5)}-${rawValue.slice(5)}`;
    else formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 5)}-${rawValue.slice(5, 10)}`;
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
    setBusinessNumber(formattedValue);
    setIsBizNumValid(null);
    if (rawValue.length === 10) {
      try {
<<<<<<< HEAD
        const res = await fetch(
          "http://localhost:8080/company/register/check-business",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessNumber: formattedValue }),
          }
        );
        if (res.ok) setIsBizNumValid(await res.json());
        else setIsBizNumValid(false);
      } catch {
        setIsBizNumValid(false);
      }
=======
        const res = await fetch("http://localhost:8080/company/register/check-business", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessNumber: formattedValue }),
        });
        if (res.ok) setIsBizNumValid(await res.json());
        else setIsBizNumValid(false);
      } catch { setIsBizNumValid(false); }
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
    }
  };

  const handleSendAuthCode = async () => {
<<<<<<< HEAD
    if (isEmailValid === false) {
      alert(emailMsg || "이메일을 확인해 주세요.");
      return;
    }
    if (isEmailValid === null) {
      alert("이메일 중복 확인 중입니다.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });
      if (res.ok) {
        alert(await res.text());
        setAuthCode("");
        setIsAuthVerified(false);
      } else alert("메일 발송 실패: 서버 오류");
    } catch {
      alert("서버 연결 실패");
=======
    if (isEmailValid === false) return; 
    if (isEmailValid === null) return;

    try {
      const res = await fetch("http://localhost:8080/api/mail/send", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }),
      });
      if (res.ok) { 
        setAuthCode(""); 
        setIsAuthVerified(false);
        
        // [수정] 딜레이(setTimeout) 제거 -> 즉시 변경
        setEmailMsg("인증번호가 발송되었습니다");
        
      } else {
        setIsEmailValid(false);
        setEmailMsg("인증번호 발송에 실패했습니다");
      }
    } catch { 
        console.error("서버 오류");
        setIsEmailValid(false);
        setEmailMsg("서버 오류가 발생했습니다");
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
    }
  };

  const handleVerifyAuthCode = async () => {
<<<<<<< HEAD
    if (!authCode) {
      alert("인증코드를 입력해 주세요.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/mail/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, authCode: authCode }),
      });
      if (res.ok) {
        if (await res.json()) {
          alert("이메일 인증 성공!");
          setIsAuthVerified(true);
        } else {
          alert("인증코드가 일치하지 않습니다.");
          setIsAuthVerified(false);
        }
      } else alert("인증 확인 오류");
    } catch {
      alert("서버 연결 실패");
    }
  };

  const handleRegister = async () => {
    if (
      !userId ||
      !email ||
      !authCode ||
      !password ||
      !passwordCheck ||
      !userName ||
      !nickname ||
      !phoneNumber
    ) {
      alert("모든 정보를 입력해 주세요.");
      return;
    }
    if (isIdAvailable !== true) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }
    if (isEmailValid !== true) {
      alert("이메일을 확인해 주세요.");
      return;
    }
    if (isPwdValid === false) {
      alert("비밀번호 형식을 확인해 주세요.");
      return;
    }
    if (isPwdMatch === false) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (isNicknameAvailable !== true) {
      alert("닉네임 중복 확인을 해주세요.");
      return;
    }
    if (!isAuthVerified) {
      alert("이메일 인증을 완료해 주세요.");
      return;
    }
    if (!isIndividual && isBizNumValid !== true) {
      alert("올바른 사업자등록번호를 입력하고 확인해 주세요.");
      return;
    }

    const data = {
      userId,
      email,
      password,
      passwordCheck,
      name: userName,
      nickname,
      phoneNumber,
      authCode,
      ...(!isIndividual && { businessNumber: businessNumber }),
    };
    const url = isIndividual
      ? "http://localhost:8080/user/register/general"
      : "http://localhost:8080/company/register/proc";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert(isIndividual ? "회원가입 성공!" : "기업 회원가입 성공!");
        navigate("/login");
      } else {
        alert("가입 실패: " + (await res.text()));
      }
    } catch {
      alert("서버 연결 실패");
    }
  };

  // =================================================================
  // 4. 화면 렌더링 (JSX) - UI 순서 변경
  // =================================================================
=======
    if (!authCode) return; 
    try {
      const res = await fetch("http://localhost:8080/api/mail/verify", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, authCode: authCode }),
      });
      if (res.ok) {
        if (await res.json()) { 
          setIsAuthVerified(true);
          setCodeMsg("인증이 완료되었습니다");
        }
        else { 
          setIsAuthVerified(false); 
          setCodeMsg("인증번호가 일치하지 않습니다"); 
        }
      }
    } catch { console.error("서버 오류"); }
  };

  const handleRegister = async () => {
    if (!userId || !email || !password || !passwordCheck || !userName || !nickname || !phoneNumber) return;
    
    if (!isAuthVerified && !authCode && !isGoogle) return; 
    if (isIdAvailable !== true) return;
    if (isEmailValid !== true) return;
    if (isPwdValid === false) return;
    if (isPwdMatch === false) return;
    if (isNicknameAvailable !== true) return;
    if (!isIndividual && isBizNumValid !== true) return;
    if (isPhoneValid === false) return; 

    const data = {
      userId, email, password, passwordCheck, name: userName, nickname, phoneNumber, 
      authCode: authCode || "GOOGLE_PASS", 
      ...( !isIndividual && { businessNumber: businessNumber } )
    };
    const url = isIndividual ? "http://localhost:8080/user/register/general" : "http://localhost:8080/company/register/proc";

    try {
      const res = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (res.ok) { 
        navigate("/success", { 
            state: { 
                title: "회원가입 완료", 
                message: "회원가입이 성공적으로 완료되었습니다." 
            } 
        });
      } else { console.error(await res.text()); }
    } catch { console.error("서버 오류"); }
  };

>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
  return (
    <div className="register-page-wrapper">
      <div className="register-box">
        <h2 className="register-title">회원가입</h2>

        <div className="register-tabs">
<<<<<<< HEAD
          <button
            className={`tab-btn ${isIndividual ? "active" : ""}`}
            onClick={() => {
              setIsIndividual(true);
              resetForm();
            }}
          >
            개인회원
          </button>
          <button
            className={`tab-btn ${!isIndividual ? "active" : ""}`}
            onClick={() => {
              setIsIndividual(false);
              resetForm();
            }}
          >
            기업회원
          </button>
        </div>

        <div className="form-container">
          {/* 1. 사업자등록번호 (기업회원일 때 맨 위) */}
          {!isIndividual && (
            <div className="form-group">
              <label className="form-label">사업자등록번호</label>
              <input
                type="text"
                className={`reg-input ${
                  isBizNumValid === false ? "input-error" : ""
                }`}
                placeholder="사업자 등록번호 10자리"
                value={businessNumber}
                onChange={handleBusinessNumberChange}
                maxLength={12}
              />
              {isBizNumValid === true && (
                <span className="valid-msg">확인 완료.</span>
              )}
              {isBizNumValid === false && (
                <span className="error-msg">유효하지 않은 번호입니다.</span>
              )}
            </div>
          )}

          {/* 2. 아이디 */}
          <div className="form-group">
            <label className="form-label">아이디</label>
            <div className="input-with-btn">
              <input
                type="text"
                className={`reg-input ${
                  isIdAvailable === false ? "input-error" : ""
                }`}
                placeholder="영문 소문자/숫자 4~12자"
                value={userId}
                onChange={handleIdChange}
              />
              <button className="btn-small" onClick={handleCheckId}>
                중복확인
              </button>
            </div>
            {isIdAvailable === true && (
              <span className="valid-msg">사용 가능한 아이디입니다.</span>
            )}
            {isIdAvailable === false && (
              <span className="error-msg">이미 사용중인 아이디입니다.</span>
            )}
          </div>

          {/* 3. 이메일 및 인증 */}
          <div className="form-group">
            <label className="form-label">이메일(인증)</label>
            <div className="input-with-btn">
              <input
                type="text"
                className={`reg-input ${
                  isEmailValid === false ? "input-error" : ""
                }`}
                placeholder="이메일을 입력해 주세요."
                value={email}
                onChange={handleEmailChange}
                disabled={isAuthVerified}
              />
              <button
                className="btn-small"
                onClick={handleSendAuthCode}
                disabled={isAuthVerified}
              >
                인증코드 발송
              </button>
            </div>
            {isEmailValid === false && (
              <span className="error-msg">{emailMsg}</span>
            )}
            {isEmailValid === true && (
              <span className="valid-msg">{emailMsg}</span>
            )}

            <div className="input-with-btn">
              <input
                type="text"
                className="reg-input"
                placeholder="인증코드 6자리"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                disabled={isAuthVerified}
              />
              <button
                className="btn-small"
                onClick={handleVerifyAuthCode}
                disabled={isAuthVerified}
              >
                {isAuthVerified ? "인증완료" : "인증하기"}
              </button>
            </div>
          </div>

          {/* 4. 비밀번호 */}
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              className={`reg-input ${
                isPwdValid === false ? "input-error" : ""
              }`}
              placeholder="8~16자/영문 대소문자,숫자,특수문자 조합"
              value={password}
              onChange={handlePasswordChange}
            />
            {isPwdValid === false && (
              <span className="error-msg">옳지 않은 비밀번호 형식입니다.</span>
            )}

            <input
              type="password"
              className={`reg-input ${
                isPwdMatch === false ? "input-error" : ""
              }`}
              placeholder="비밀번호를 재입력해 주세요."
              value={passwordCheck}
              onChange={handlePasswordCheckChange}
            />
            {isPwdMatch === false && (
              <span className="error-msg">비밀번호가 일치하지 않습니다.</span>
            )}
          </div>

          {/* 5. 이름 및 닉네임 */}
          <div className="form-group">
            <label className="form-label">이름(닉네임)</label>
            <input
              type="text"
              className="reg-input"
              placeholder="이름을 입력해 주세요."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            <div className="input-with-btn" style={{ marginTop: "5px" }}>
              <input
                type="text"
                className={`reg-input ${
                  isNicknameAvailable === false ? "input-error" : ""
                }`}
                placeholder="닉네임을 입력해 주세요."
                value={nickname}
                onChange={handleNicknameChange}
              />
              <button className="btn-small" onClick={handleCheckNickname}>
                중복확인
              </button>
            </div>
            {isNicknameAvailable === true && (
              <span className="valid-msg">사용 가능한 닉네임입니다.</span>
            )}
            {isNicknameAvailable === false && (
              <span className="error-msg">이미 사용중인 닉네임입니다.</span>
            )}
          </div>

          {/* 6. 휴대전화번호 */}
          <div className="form-group">
            <label className="form-label">휴대전화번호</label>
            <input
              type="text"
              className="reg-input"
              placeholder="번호를 입력해 주세요."
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              maxLength={13}
            />
          </div>

          {/* 회원가입 완료 버튼 */}
=======
          <button className={`tab-btn ${isIndividual ? "active" : ""}`} onClick={() => { setIsIndividual(true); resetForm(); }}>개인회원</button>
          <button className={`tab-btn ${!isIndividual ? "active" : ""}`} onClick={() => { setIsIndividual(false); resetForm(); }}>기업회원</button>
        </div>

        <div className="form-container">
          {!isIndividual && (
            <div className="form-group">
              <label className="form-label">사업자등록번호</label>
              <input type="text" className={`reg-input ${isBizNumValid === false ? "input-error" : ""}`} 
                     placeholder="사업자 등록번호 10자리" value={businessNumber} onChange={handleBusinessNumberChange} maxLength={12} />
              {isBizNumValid === true && <span className="valid-msg">확인 완료</span>}
              {isBizNumValid === false && <span className="error-msg">유효하지 않은 번호입니다</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">아이디</label>
            <div className="input-with-btn">
              <input type="text" className={`reg-input ${isIdAvailable === false ? "input-error" : ""}`} 
                     placeholder="영문 소문자/숫자 4~12자" value={userId} onChange={handleIdChange} />
              <button className="btn-small" onClick={handleCheckId}>중복확인</button>
            </div>
            {isIdAvailable === true && <span className="valid-msg">사용 가능한 아이디입니다.</span>}
            {isIdAvailable === false && <span className="error-msg">이미 사용중인 아이디입니다</span>}
          </div>

          <div className="form-group">
            <label className="form-label">이메일</label>
            <div className="input-with-btn">
              <input 
                type="text" 
                className={`reg-input ${isEmailValid === false ? "input-error" : ""}`} 
                placeholder="이메일을 입력해 주세요." 
                value={email} 
                onChange={handleEmailChange} 
                readOnly={isAuthVerified} 
                style={isAuthVerified ? { backgroundColor: "#e9ecef", color: "#6c757d" } : {}}
              />
              <button className="btn-small" onClick={handleSendAuthCode} disabled={isAuthVerified}>
                {isAuthVerified ? "인증완료" : "인증코드 발송"}
              </button>
            </div>
            
            {/* 이메일 메시지 */}
            {isEmailValid === false && <span className="error-msg">{emailMsg}</span>}
            {isEmailValid === true && <span className="valid-msg">{emailMsg}</span>}
            
            <div className="input-with-btn" style={{marginTop: '10px'}}>
              <input type="text" className="reg-input" placeholder="인증코드 6자리" 
                     value={authCode} onChange={(e) => setAuthCode(e.target.value)} 
                     readOnly={isAuthVerified} 
                     disabled={isAuthVerified} 
                     style={isAuthVerified ? { backgroundColor: "#e9ecef" } : {}}
              />
              <button className="btn-small" onClick={handleVerifyAuthCode} disabled={isAuthVerified}>
                {isAuthVerified ? "확인완료" : "인증하기"}
              </button>
            </div>
            
            {/* 인증 완료 메시지 (스타일 통일) */}
            {codeMsg && (
                <span className={isAuthVerified ? "valid-msg" : "error-msg"}>
                    {codeMsg}
                </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input type="password" className={`reg-input ${isPwdValid === false ? "input-error" : ""}`} 
                   placeholder="8~16자/영문 대소문자,숫자,특수문자 조합" value={password} onChange={handlePasswordChange} />
            {isPwdValid === false && (<span className="error-msg">옳지 않은 비밀번호 형식입니다</span>)}

            <input type="password" className={`reg-input ${isPwdMatch === false ? "input-error" : ""}`} 
                   placeholder="비밀번호를 재입력해 주세요" value={passwordCheck} onChange={handlePasswordCheckChange} />
            {isPwdMatch === false && <span className="error-msg">비밀번호가 일치하지 않습니다.</span>}
          </div>

          <div className="form-group">
            <label className="form-label">이름(닉네임)</label>
            <input type="text" className="reg-input" placeholder="이름을 입력해 주세요" 
                   value={userName} onChange={(e) => setUserName(e.target.value)} 
                   readOnly={isGoogle} 
                   style={isGoogle ? { backgroundColor: "#e9ecef", color: "#6c757d" } : {}}
            />
            
            <div className="input-with-btn" style={{marginTop:"5px"}}>
                <input type="text" className={`reg-input ${isNicknameAvailable === false ? "input-error" : ""}`} 
                       placeholder="닉네임을 입력해 주세요." value={nickname} onChange={handleNicknameChange} />
                <button className="btn-small" onClick={handleCheckNickname}>중복확인</button>
            </div>
            {isNicknameAvailable === true && <span className="valid-msg">사용 가능한 닉네임입니다</span>}
            {isNicknameAvailable === false && <span className="error-msg">이미 사용중인 닉네임입니다</span>}
          </div>

          <div className="form-group">
            <label className="form-label">휴대전화번호</label>
            <input 
                type="text" 
                className={`reg-input ${isPhoneValid === false ? "input-error" : ""}`} 
                placeholder="번호를 입력해 주세요" 
                value={phoneNumber} 
                onChange={handlePhoneNumberChange} 
                maxLength={13} 
            />
            {isPhoneValid === false && (
                <span className="error-msg">올바른 전화번호 형식이 아닙니다</span>
            )}
          </div>

>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
          <button className="btn-submit" onClick={handleRegister}>
            회원가입 완료
          </button>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default RegisterPage;
=======
export default RegisterPage;
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
