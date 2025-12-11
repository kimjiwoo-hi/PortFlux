import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FindPage.css"; // ★ 수정된 CSS 파일 임포트

function FindPasswordPage() {
  const navigate = useNavigate();

  // ==========================================
  // 1. 상태 변수 (기존 코드 유지)
  // ==========================================
  const [step, setStep] = useState(1); 
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [showAuthInput, setShowAuthInput] = useState(false); 
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [emailMsg, setEmailMsg] = useState("");
  const [isPwdValid, setIsPwdValid] = useState(null);
  const [isPwdMatch, setIsPwdMatch] = useState(null);
  const [serverErrorMsg, setServerErrorMsg] = useState(""); 
  const [isAuthVerified, setIsAuthVerified] = useState(false); 

  // ==========================================
  // 2. 정규식 (기존 코드 유지)
  // ==========================================
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  // ==========================================
  // 3. 핸들러 (기존 코드 유지)
  // ==========================================
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setIsAuthVerified(false); 
    setShowAuthInput(false); 

    if (val.length === 0) {
      setIsEmailValid(null);
      setEmailMsg("");
      return;
    }
    if (!emailRegex.test(val)) {
      setIsEmailValid(false);
      setEmailMsg("올바른 이메일 형식이 아닙니다.");
    } else {
      setIsEmailValid(true);
      setEmailMsg("");
    }
  };

  const handleSendAuthCode = async () => {
    if (!isEmailValid) { alert("올바른 이메일을 입력해 주세요."); return; }
    try {
      const res = await fetch("http://localhost:8080/api/mail/send", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      if (res.ok) {
        alert("인증코드가 발송되었습니다.");
        setShowAuthInput(true); 
      } else alert("메일 발송 실패");
    } catch { alert("서버 연결 실패"); }
  };

  const handleVerifyAuthCode = async () => {
    if (!authCode) { alert("인증코드를 입력해 주세요."); return; }
    try {
      const res = await fetch("http://localhost:8080/api/mail/verify", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, authCode }),
      });
      if (res.ok && await res.json()) {
        alert("이메일 인증 성공!");
        setIsAuthVerified(true);
      } else {
        alert("인증코드가 일치하지 않습니다.");
        setIsAuthVerified(false);
      }
    } catch { alert("서버 연결 실패"); }
  };

  const handleGoToReset = () => {
    if (!userId || !name || !email) { alert("모든 정보를 입력해 주세요."); return; }
    if (!isAuthVerified) { alert("이메일 인증을 완료해 주세요."); return; }
    setStep(2); 
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    setServerErrorMsg(""); 
    
    if (val.length === 0) setIsPwdValid(null);
    else setIsPwdValid(passwordRegex.test(val));
    if (confirmPassword.length > 0) setIsPwdMatch(val === confirmPassword);
  };

  const handleConfirmChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (val.length === 0) setIsPwdMatch(null);
    else setIsPwdMatch(val === newPassword);
  };

  const handleSubmitChange = async () => {
    if (isPwdValid !== true) { alert("비밀번호 형식을 확인해 주세요."); return; }
    if (isPwdMatch !== true) { alert("비밀번호가 일치하지 않습니다."); return; }

    try {
      const res = await fetch("http://localhost:8080/user/find/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, newPassword: newPassword }),
      });

      if (res.ok) {
        alert("비밀번호가 변경되었습니다. 로그인해 주세요.");
        navigate("/login");
      } else {
        const errorText = await res.text();
        if (errorText.includes("이전 비밀번호")) {
            setServerErrorMsg("이전 비밀번호로는 변경할 수 없습니다.");
        } else {
            alert("변경 실패: " + errorText);
        }
      }
    } catch { alert("서버 오류가 발생했습니다."); }
  };

  // ==========================================
  // 4. 화면 렌더링 (JSX) - 클래스명 변경
  // ==========================================
  return (
    <div className="find-wrapper"> {/* register-page-wrapper -> find-wrapper */}
      <div className="find-box">     {/* register-box -> find-box */}
        <h2 className="find-title">    {/* register-title -> find-title */}
            {step === 1 ? "비밀번호 찾기" : "비밀번호 변경"}
        </h2>

        {/* ================= Step 1 ================= */}
        {step === 1 && (
          <div className="form-container">
            <div className="form-group">
              <label className="form-label">아이디</label>
              <input type="text" className="find-input" placeholder="아이디를 입력하세요" 
                     value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">이름</label>
              <input type="text" className="find-input" placeholder="이름을 입력하세요" 
                     value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">이메일</label>
              <div className="input-with-btn">
                <input type="text" 
                       className={`find-input ${isEmailValid === false ? "input-error" : ""}`}
                       placeholder="이메일을 입력하세요" 
                       value={email} onChange={handleEmailChange} 
                />
                <button className="btn-small" onClick={handleSendAuthCode}>인증번호</button>
              </div>
              
              {isEmailValid === false && <span className="error-msg">{emailMsg}</span>}

              {showAuthInput && (
                <div className="input-with-btn" style={{marginTop:"0px"}}> {/* 간격 조정 */}
                    <input type="text" className="find-input" placeholder="인증번호 6자리" 
                        value={authCode} onChange={(e) => setAuthCode(e.target.value)} 
                        disabled={isAuthVerified} 
                    />
                    <button className="btn-small" onClick={handleVerifyAuthCode} disabled={isAuthVerified}>
                    {isAuthVerified ? "완료" : "확인"}
                    </button>
                </div>
              )}
            </div>

            <button className="btn-submit" onClick={handleGoToReset}>
              비밀번호 찾기
            </button>
          </div>
        )}

        {/* ================= Step 2 ================= */}
        {step === 2 && (
          <div className="form-container">
            <p className="info-text">
                새로운 비밀번호를 설정해 주세요.<br/>
                (8~16자, 대/소문자, 숫자, 특수문자 포함)
            </p>

            <div className="form-group">
              <label className="form-label">새 비밀번호</label>
              <input type="password" 
                     className={`find-input ${isPwdValid === false || serverErrorMsg ? "input-error" : ""}`}
                     placeholder="8~16자 (영문, 숫자, 특수문자)" 
                     value={newPassword} onChange={handlePasswordChange} />
              
              {isPwdValid === false && <span className="error-msg">올바른 비밀번호 형식이 아닙니다.</span>}
              {serverErrorMsg && <span className="error-msg">{serverErrorMsg}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">새 비밀번호 확인</label>
              <input type="password" 
                     className={`find-input ${isPwdMatch === false ? "input-error" : ""}`}
                     placeholder="비밀번호를 다시 입력해 주세요." 
                     value={confirmPassword} onChange={handleConfirmChange} />
              {isPwdMatch === false && <span className="error-msg">비밀번호가 일치하지 않습니다.</span>}
            </div>

            <button className="btn-submit" onClick={handleSubmitChange}>
              비밀번호 변경 완료
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default FindPasswordPage;