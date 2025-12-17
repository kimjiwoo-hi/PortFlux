import { useState, useEffect } from "react";
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

  const handleIdChange = (e) => {
    setUserId(e.target.value);
    setIsIdAvailable(null);
  };

  const handleCheckId = async () => {
    if (!userId) return; 
    if (!idRegex.test(userId)) return;
    try {
      const res = await fetch("http://localhost:8080/user/register/check-id", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: userId }),
      });
      if (res.ok) {
        const isDuplicate = await res.json();
        if (isDuplicate) setIsIdAvailable(false);
        else setIsIdAvailable(true);
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
    if (!nickname) return;
    try {
      const res = await fetch("http://localhost:8080/user/register/check-nickname", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ nickname }),
      });
      
      if (res.ok) {
          const isAvailable = await res.json(); 
          setIsNicknameAvailable(isAvailable); 
      } else {
          console.error("서버 에러");
      }
    } catch (e) { 
        console.error("연결 실패", e); 
    }
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
    setBusinessNumber(formattedValue);
    setIsBizNumValid(null);
    if (rawValue.length === 10) {
      try {
        const res = await fetch("http://localhost:8080/company/register/check-business", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessNumber: formattedValue }),
        });
        if (res.ok) setIsBizNumValid(await res.json());
        else setIsBizNumValid(false);
      } catch { setIsBizNumValid(false); }
    }
  };

  const handleSendAuthCode = async () => {
    if (isEmailValid === false) return; 
    if (isEmailValid === null) return;

    try {
      const res = await fetch("http://localhost:8080/api/mail/send", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }),
      });
      if (res.ok) { 
        setAuthCode(""); 
        setIsAuthVerified(false);
        setEmailMsg("인증번호가 발송되었습니다");
      } else {
        setIsEmailValid(false);
        setEmailMsg("인증번호 발송에 실패했습니다");
      }
    } catch { 
        console.error("서버 오류");
        setIsEmailValid(false);
        setEmailMsg("서버 오류가 발생했습니다");
    }
  };

  const handleVerifyAuthCode = async () => {
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
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", userId);
        localStorage.setItem("userNickname", nickname);
        localStorage.setItem("userEmail", email);

        navigate("/success", { 
            state: { 
                title: "회원가입 완료", 
                message: "회원가입이 성공적으로 완료되었습니다." 
            } 
        });
      } else { console.error(await res.text()); }
    } catch { console.error("서버 오류"); }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-box">
        <h2 className="register-title">회원가입</h2>

        <div className="register-tabs">
          <button className={`reg-tab-btn ${isIndividual ? "active" : ""}`} onClick={() => { setIsIndividual(true); resetForm(); }}>개인회원</button>
          <button className={`reg-tab-btn ${!isIndividual ? "active" : ""}`} onClick={() => { setIsIndividual(false); resetForm(); }}>기업회원</button>
        </div>

        <div className="form-container">
          {!isIndividual && (
            <div className="form-group">
              <label className="form-label">사업자등록번호</label>
              <input type="text" className={`reg-input ${isBizNumValid === false ? "input-error" : ""}`} 
                   placeholder="사업자 등록번호 10자리" value={businessNumber} onChange={handleBusinessNumberChange} maxLength={12} />
              {isBizNumValid === true && <span className="valid-msg">사업자등록번호 확인완료</span>}
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
                <input 
                    type="text" 
                    className={`reg-input ${isNicknameAvailable === false ? "input-error" : ""}`} 
                    placeholder="닉네임을 입력해 주세요." 
                    value={nickname} 
                    onChange={handleNicknameChange} 
                />
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

          <button className="btn-submit" onClick={handleRegister}>
            회원가입 완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;