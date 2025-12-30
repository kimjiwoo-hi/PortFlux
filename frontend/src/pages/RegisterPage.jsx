import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();

  // 1. 상태 변수 선언
  const [isIndividual, setIsIndividual] = useState(true);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [userName, setUserName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");

  const [isBizNumValid, setIsBizNumValid] = useState(null);
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [emailMsg, setEmailMsg] = useState("");
  const [isPwdValid, setIsPwdValid] = useState(null);
  const [isPwdMatch, setIsPwdMatch] = useState(null);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [codeMsg, setCodeMsg] = useState(""); 
  const [isPhoneValid, setIsPhoneValid] = useState(null);

  // 2. 정규식
  const idRegex = /^[a-z0-9]{4,12}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  const resetForm = () => {
    setUserId(""); setIsIdAvailable(null);
    setEmail(""); setEmailMsg("");
    setAuthCode(""); setPassword(""); setPasswordCheck("");
    setUserName(""); setNickname(""); setPhoneNumber(""); setBusinessNumber("");
    setIsBizNumValid(null); setIsEmailValid(null); setIsPwdValid(null);
    setIsPwdMatch(null); setIsNicknameAvailable(null); setIsAuthVerified(false);
    setCodeMsg(""); setIsPhoneValid(null);
  };

  // 3. 핸들러 함수들
  const handleIdChange = (e) => {
    setUserId(e.target.value);
    setIsIdAvailable(null);
  };

  const handleCheckId = async () => {
    if (!userId) { alert("아이디를 입력해 주세요."); return; }
    if (!idRegex.test(userId)) { alert("아이디는 영문 소문자/숫자 4~12자여야 합니다."); return; }
    try {
      // [수정] URL 절대경로 및 /api 추가
      const res = await fetch("http://localhost:8080/api/user/register/check-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId }),
      });
      if (res.ok) {
        const isDuplicate = await res.json();
        setIsIdAvailable(!isDuplicate);
        if(isDuplicate) alert("이미 사용 중인 아이디입니다.");
        else alert("사용 가능한 아이디입니다.");
      } else {
        alert("중복 확인 중 에러가 발생했습니다. (관리자 문의)");
      }
    } catch (error) {
      console.error("아이디 중복 체크 실패:", error);
      alert("서버 연결 실패");
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setIsAuthVerified(false);
    if (val.length === 0) { setIsEmailValid(null); setEmailMsg(""); return; }
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
        const res = await fetch("http://localhost:8080/api/user/register/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        });
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
      } catch (error) {
        console.error("이메일 체크 에러:", error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [email]);

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
    if (!nickname) { alert("닉네임을 입력해 주세요."); return; }
    try {
      const res = await fetch("http://localhost:8080/api/user/register/check-nickname", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ nickname }),
      });
      if (res.ok) {
          const isAvailable = await res.json(); 
          setIsNicknameAvailable(isAvailable);
          if(!isAvailable) alert("이미 사용 중인 닉네임입니다.");
          else alert("사용 가능한 닉네임입니다.");
      }
    } catch (error) { 
        console.error("닉네임 체크 연결 실패:", error); 
    }
  };

  const handlePhoneNumberChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    let formattedValue = "";
    if (rawValue.length <= 3) formattedValue = rawValue;
    else if (rawValue.length <= 7) formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    else formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
    setPhoneNumber(formattedValue);
    setIsPhoneValid(rawValue.length === 11);
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
        const res = await fetch("http://localhost:8080/api/company/register/check-business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessNumber: formattedValue }),
        });

        if (res.ok) {
          const isValid = await res.json();
          console.log("사업자번호 검증 결과:", isValid);
          setIsBizNumValid(isValid);
        } else {
          console.error("HTTP 에러:", res.status);
          setIsBizNumValid(false);
        }
      } catch (error) {
        console.error("사업자 번호 체크 실패:", error);
        setIsBizNumValid(false);
      }
    }
  };

  const handleSendAuthCode = async () => {
    if (!isEmailValid) { alert("이메일을 확인해 주세요."); return; }
    try {
      const res = await fetch("http://localhost:8080/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });
      if (res.ok) {
        alert("인증코드가 발송되었습니다.");
        setAuthCode(""); setIsAuthVerified(false);
      }
    } catch (error) {
      console.error("메일 발송 에러:", error);
      alert("서버 연결 실패");
    }
  };

  const handleVerifyAuthCode = async () => {
    if (!authCode) { alert("인증코드를 입력해 주세요."); return; }
    try {
      const res = await fetch("http://localhost:8080/api/mail/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, authCode: authCode }),
      });
      if (res.ok) {
        const isSuccess = await res.json();
        if (isSuccess) {
          alert("이메일 인증 성공!");
          setIsAuthVerified(true);
          setCodeMsg("인증이 완료되었습니다.");
        } else {
          alert("인증코드가 일치하지 않습니다.");
          setIsAuthVerified(false);
          setCodeMsg("코드가 틀렸습니다.");
        }
      }
    } catch (error) {
      console.error("인증 확인 에러:", error);
      alert("서버 연결 실패");
    }
  };

  const handleRegister = async () => {
    if (!userId || !email || !password || !passwordCheck || !userName || !nickname || !phoneNumber) {
        alert("모든 필수 항목을 입력해주세요."); return;
    }
    if (!isAuthVerified) { alert("이메일 인증을 완료해주세요."); return; }
    if (isIdAvailable !== true) { alert("아이디 중복 확인을 해주세요."); return; }
    if (isNicknameAvailable !== true) { alert("닉네임 중복 확인을 해주세요."); return; }
    if (!isIndividual && isBizNumValid !== true) { alert("사업자 인증을 완료해주세요."); return; }
    if (isPhoneValid === false) { alert("전화번호 11자리를 확인해주세요."); return; }

    const data = {
      userId, email, password, passwordCheck, name: userName, nickname, phoneNumber, authCode,
      ...( !isIndividual && { businessNumber: businessNumber } )
    };

    // [수정] URL 절대경로 및 /api 추가
    const url = isIndividual ? "http://localhost:8080/api/user/register/general" : "http://localhost:8080/api/company/register/proc";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (res.ok) { 
        navigate("/success", { state: { title: "회원가입 완료", message: "성공적으로 가입되었습니다!" } });
      } else { 
          const msg = await res.text();
          alert("회원가입 실패: " + msg);
      }
    } catch (error) { 
        console.error("최종 등록 에러:", error);
        alert("서버 연결에 실패했습니다.");
    }
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
              <input type="text" className={`reg-input ${isBizNumValid === false ? "input-error" : isBizNumValid === true ? "" : ""}`}
                     placeholder="사업자 등록번호 10자리" value={businessNumber} onChange={handleBusinessNumberChange} maxLength={12} />
              {isBizNumValid === true && <span className="valid-msg">✓ 유효한 사업자번호입니다</span>}
              {isBizNumValid === false && <span className="error-msg">✗ 유효하지 않은 사업자번호입니다</span>}
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
            <label className="form-label">이메일 인증</label>
            <div className="input-with-btn">
              <input type="text" className={`reg-input ${isEmailValid === false ? "input-error" : ""}`}
                placeholder="이메일을 입력하세요" value={email} onChange={handleEmailChange} disabled={isAuthVerified} />
              <button className="btn-small" onClick={handleSendAuthCode} disabled={isAuthVerified}>코드발송</button>
            </div>
            {emailMsg && <span className={isEmailValid ? "valid-msg" : "error-msg"}>{emailMsg}</span>}
            <div className="input-with-btn" style={{marginTop: "10px"}}>
              <input type="text" className="reg-input" placeholder="인증코드 6자리" value={authCode} 
                     onChange={(e) => setAuthCode(e.target.value)} disabled={isAuthVerified} />
              <button className="btn-small" onClick={handleVerifyAuthCode} disabled={isAuthVerified}>{isAuthVerified ? "인증완료" : "인증하기"}</button>
            </div>
            {codeMsg && <span className={isAuthVerified ? "valid-msg" : "error-msg"}>{codeMsg}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input type="password" className={`reg-input ${isPwdValid === false ? "input-error" : ""}`} 
                   placeholder="8~16자/대소문자,숫자,특수문자" value={password} onChange={handlePasswordChange} />
            <input type="password" className={`reg-input ${isPwdMatch === false ? "input-error" : ""}`} 
                   style={{marginTop: "10px"}} placeholder="비밀번호 재입력" value={passwordCheck} onChange={handlePasswordCheckChange} />
            {isPwdMatch === false && <span className="error-msg">비밀번호가 일치하지 않습니다.</span>}
          </div>

          <div className="form-group">
            <label className="form-label">성함 및 닉네임</label>
            <input type="text" className="reg-input" placeholder="이름을 입력하세요" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <div className="input-with-btn" style={{ marginTop: "10px" }}>
              <input type="text" className={`reg-input ${isNicknameAvailable === false ? "input-error" : ""}`} 
                     placeholder="닉네임을 입력하세요" value={nickname} onChange={handleNicknameChange} />
              <button className="btn-small" onClick={handleCheckNickname}>중복확인</button>
            </div>
            {isNicknameAvailable === true && <span className="valid-msg">사용 가능</span>}
            {isNicknameAvailable === false && <span className="error-msg">이미 사용 중</span>}
          </div>

          <div className="form-group">
            <label className="form-label">휴대전화번호</label>
            <input type="text" className={`reg-input ${isPhoneValid === false ? "input-error" : ""}`} 
                   placeholder="010-0000-0000" value={phoneNumber} onChange={handlePhoneNumberChange} maxLength={13} />
            {isPhoneValid === false && <span className="error-msg">11자리 번호를 입력해주세요.</span>}
          </div>

          <button className="btn-submit" onClick={handleRegister}>회원가입 완료</button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;