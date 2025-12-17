import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import "./FindPage.css"; // ★ 수정된 CSS 파일 임포트
=======
import "./FindPage.css"; 
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4

function FindPasswordPage() {
  const navigate = useNavigate();

  // ==========================================
<<<<<<< HEAD
  // 1. 상태 변수 (기존 코드 유지)
  // ==========================================
  const [step, setStep] = useState(1);
=======
  // 1. 상태 변수
  // ==========================================
  // [수정] step 상태 삭제됨

>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
<<<<<<< HEAD
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
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  // ==========================================
  // 3. 핸들러 (기존 코드 유지)
=======
  const [showAuthInput, setShowAuthInput] = useState(false); 
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [emailMsg, setEmailMsg] = useState(""); 
  const [isEmailError, setIsEmailError] = useState(false); 

  const [isPwdValid, setIsPwdValid] = useState(null);
  const [isPwdMatch, setIsPwdMatch] = useState(null);
  const [serverErrorMsg, setServerErrorMsg] = useState(""); 
  
  const [isAuthVerified, setIsAuthVerified] = useState(false); 
  const [authMsg, setAuthMsg] = useState(""); 

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  // ==========================================
  // 3. 핸들러
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
  // ==========================================
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
<<<<<<< HEAD
    setIsAuthVerified(false);
    setShowAuthInput(false);
=======
    setIsAuthVerified(false); 
    setShowAuthInput(false); 
    setAuthMsg("");
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4

    if (val.length === 0) {
      setIsEmailValid(null);
      setEmailMsg("");
      return;
    }
    if (!emailRegex.test(val)) {
      setIsEmailValid(false);
<<<<<<< HEAD
      setEmailMsg("올바른 이메일 형식이 아닙니다.");
    } else {
      setIsEmailValid(true);
      setEmailMsg("");
=======
      setEmailMsg("올바른 이메일 형식이 아닙니다");
      setIsEmailError(true);
    } else {
      setIsEmailValid(true);
      setEmailMsg("사용 가능한 이메일 형식입니다");
      setIsEmailError(false);
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
    }
  };

  const handleSendAuthCode = async () => {
<<<<<<< HEAD
    if (!isEmailValid) {
      alert("올바른 이메일을 입력해 주세요.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        alert("인증코드가 발송되었습니다.");
        setShowAuthInput(true);
      } else alert("메일 발송 실패");
    } catch {
      alert("서버 연결 실패");
=======
    if (!isEmailValid) return; 
    
    try {
      const res = await fetch("http://localhost:8080/api/mail/send", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setShowAuthInput(true);
        setEmailMsg("인증번호가 발송되었습니다");
        setIsEmailError(false);
      } else {
        setEmailMsg("가입되지 않은 이메일입니다");
        setIsEmailError(true);
      }
    } catch (e) { 
      console.error(e);
      setEmailMsg("서버 오류가 발생했습니다");
      setIsEmailError(true);
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
        body: JSON.stringify({ email, authCode }),
      });
      if (res.ok && (await res.json())) {
        alert("이메일 인증 성공!");
        setIsAuthVerified(true);
      } else {
        alert("인증코드가 일치하지 않습니다.");
        setIsAuthVerified(false);
      }
    } catch {
      alert("서버 연결 실패");
    }
  };

  const handleGoToReset = () => {
    if (!userId || !name || !email) {
      alert("모든 정보를 입력해 주세요.");
      return;
    }
    if (!isAuthVerified) {
      alert("이메일 인증을 완료해 주세요.");
      return;
    }
    setStep(2);
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    setServerErrorMsg("");

=======
    if (!authCode) return; 
    try {
      const res = await fetch("http://localhost:8080/api/mail/verify", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, authCode }),
      });
      if (res.ok && await res.json()) {
        setIsAuthVerified(true);
        setAuthMsg("인증이 완료되었습니다");
      } else {
        setIsAuthVerified(false); 
        setAuthMsg("인증번호가 일치하지 않습니다"); 
      }
    } catch (e) { console.error(e); }
  };

  // [참고] handleGoToReset은 사실상 사용되지 않을 수 있습니다. 
  // 원래 step 변경용이었으나, 지금 구조에서는 바로 비밀번호 변경 로직과 
  // 인증 로직이 한 페이지에 있는 게 맞는지 확인이 필요합니다.
  // **사용자님의 기존 로직**은 "비밀번호 찾기" 화면에서 아이디/이름/이메일 인증을 하고,
  // 다음 단계로 넘어가서 비밀번호를 바꾸는 구조였습니다.
  // 
  // 그러나 현재 코드 구조상 모든 인풋이 한 번에 렌더링되도록 수정해 드리겠습니다.
  // (인증 전에는 비밀번호 입력창을 숨길 수도 있지만, 일단 다 보여드리고 인증 후 활성화 등의 처리를 제안드립니다.
  //  혹은 원래대로 2단계로 나누려면 step이 필요합니다.)
  
  // *** 중요 ***
  // 아까 step을 지우라고 하셔서 지웠지만, 
  // "비밀번호 찾기" -> "인증" -> "비밀번호 재설정 창"으로 넘어가는 흐름이라면
  // step 변수가 필요합니다. 
  // "step is declared but never read" 오류가 났던 이유는 
  // *이전 코드에서 navigate로 페이지를 이동시켜버려서* step을 쓸 일이 없어서 그랬던 것입니다.
  
  // 하지만 FindPasswordPage는 [인증] -> [재설정] 2단계가 한 파일 안에서 이루어지는 게 자연스럽습니다.
  // 만약 2단계로 나누고 싶으시다면 step 변수를 다시 살려야 하고,
  // 그게 아니라 한 화면에서 다 처리하려면 아래처럼 합쳐야 합니다.
  
  // -> 사용자님의 오류 메시지("step unused")를 해결하기 위해 
  //    **한 화면(Single Page)에서 인증 후 비밀번호 변경까지 처리**하도록 코드를 통합했습니다.
  
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    setServerErrorMsg(""); 
    
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
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
<<<<<<< HEAD
    if (isPwdValid !== true) {
      alert("비밀번호 형식을 확인해 주세요.");
      return;
    }
    if (isPwdMatch !== true) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:8080/user/find/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId, newPassword: newPassword }),
        }
      );

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
    } catch {
      alert("서버 오류가 발생했습니다.");
    }
  };

  // ==========================================
  // 4. 화면 렌더링 (JSX) - 클래스명 변경
  // ==========================================
  return (
    <div className="find-wrapper">
      {" "}
      {/* register-page-wrapper -> find-wrapper */}
      <div className="find-box">
        {" "}
        {/* register-box -> find-box */}
        <h2 className="find-title">
          {" "}
          {/* register-title -> find-title */}
          {step === 1 ? "비밀번호 찾기" : "비밀번호 변경"}
        </h2>
        {/* ================= Step 1 ================= */}
        {step === 1 && (
          <div className="form-container">
            <div className="form-group">
              <label className="form-label">아이디</label>
              <input
                type="text"
                className="find-input"
                placeholder="아이디를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">이름</label>
              <input
                type="text"
                className="find-input"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">이메일</label>
              <div className="input-with-btn">
                <input
                  type="text"
                  className={`find-input ${
                    isEmailValid === false ? "input-error" : ""
                  }`}
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={handleEmailChange}
                />
                <button className="btn-small" onClick={handleSendAuthCode}>
                  인증번호
                </button>
              </div>

              {isEmailValid === false && (
                <span className="error-msg">{emailMsg}</span>
              )}

              {showAuthInput && (
                <div className="input-with-btn" style={{ marginTop: "0px" }}>
                  {" "}
                  {/* 간격 조정 */}
                  <input
                    type="text"
                    className="find-input"
                    placeholder="인증번호 6자리"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    disabled={isAuthVerified}
                  />
                  <button
                    className="btn-small"
                    onClick={handleVerifyAuthCode}
                    disabled={isAuthVerified}
                  >
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
              새로운 비밀번호를 설정해 주세요.
              <br />
              (8~16자, 대/소문자, 숫자, 특수문자 포함)
            </p>

            <div className="form-group">
              <label className="form-label">새 비밀번호</label>
              <input
                type="password"
                className={`find-input ${
                  isPwdValid === false || serverErrorMsg ? "input-error" : ""
                }`}
                placeholder="8~16자 (영문, 숫자, 특수문자)"
                value={newPassword}
                onChange={handlePasswordChange}
              />

              {isPwdValid === false && (
                <span className="error-msg">
                  올바른 비밀번호 형식이 아닙니다.
                </span>
              )}
              {serverErrorMsg && (
                <span className="error-msg">{serverErrorMsg}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">새 비밀번호 확인</label>
              <input
                type="password"
                className={`find-input ${
                  isPwdMatch === false ? "input-error" : ""
                }`}
                placeholder="비밀번호를 다시 입력해 주세요."
                value={confirmPassword}
                onChange={handleConfirmChange}
              />
              {isPwdMatch === false && (
                <span className="error-msg">비밀번호가 일치하지 않습니다.</span>
              )}
            </div>

            <button className="btn-submit" onClick={handleSubmitChange}>
              비밀번호 변경 완료
            </button>
          </div>
        )}
=======
    // 유효성 검사 추가
    if (!isAuthVerified) {
        alert("이메일 인증을 먼저 진행해주세요");
        return;
    }
    if (isPwdValid !== true) return;
    if (isPwdMatch !== true) return;

    try {
      const res = await fetch("http://localhost:8080/user/find/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, newPassword: newPassword }),
      });

      if (res.ok) {
        navigate("/success", { 
          state: { message: "비밀번호 변경이 완료되었습니다!" } 
        });
      } else {
        const errorText = await res.text();
        if (errorText) {
             setServerErrorMsg(errorText);
        } else {
             setServerErrorMsg("비밀번호 변경에 실패했습니다 (서버 오류)");
        }
      }
    } catch { 
        console.error("서버 오류");
        setServerErrorMsg("서버 연결에 실패했습니다");
    }
  };

  return (
    <div className="find-wrapper">
      <div className="find-box">
        <h2 className="find-title">비밀번호 변경</h2>

        <div className="form-container">
          {/* 1. 본인 인증 섹션 */}
          <div className="form-group">
            <label className="form-label">아이디</label>
            <input type="text" className="find-input" placeholder="아이디를 입력해 주세요" 
                   value={userId} onChange={(e) => setUserId(e.target.value)} 
                   disabled={isAuthVerified} 
                   style={isAuthVerified ? { backgroundColor: "#f2f2f2" } : {}}
            />
          </div>

          <div className="form-group">
            <label className="form-label">이름</label>
            <input type="text" className="find-input" placeholder="이름을 입력해 주세요" 
                   value={name} onChange={(e) => setName(e.target.value)} 
                   disabled={isAuthVerified}
                   style={isAuthVerified ? { backgroundColor: "#f2f2f2" } : {}}
            />
          </div>

          <div className="form-group">
            <label className="form-label">이메일</label>
            <div className="input-with-btn">
              <input type="text" 
                     className={`find-input ${isEmailError ? "input-error" : ""}`}
                     placeholder="이메일을 입력하세요" 
                     value={email} onChange={handleEmailChange} 
                     disabled={isAuthVerified} 
                     style={isAuthVerified ? { backgroundColor: "#f2f2f2" } : {}}
              />
              <button 
                className="btn-small" 
                onClick={handleSendAuthCode}
                disabled={isAuthVerified}
              >
                {isAuthVerified ? "인증완료" : "인증번호"}
              </button>
            </div>
            
            {emailMsg && (
                <span style={{ 
                    color: isEmailError ? "red" : "blue", 
                    fontSize: "12px", 
                    marginTop: "5px", 
                    display: "block" 
                }}>
                    {emailMsg}
                </span>
            )}

            {showAuthInput && (
              <div className="input-with-btn" style={{marginTop:"10px"}}>
                  <input type="text" className="find-input" placeholder="인증번호 6자리" 
                         value={authCode} onChange={(e) => setAuthCode(e.target.value)} 
                         disabled={isAuthVerified} 
                         style={isAuthVerified ? { backgroundColor: "#f2f2f2" } : {}}
                  />
                  <button className="btn-small" onClick={handleVerifyAuthCode} disabled={isAuthVerified}>
                  {isAuthVerified ? "완료" : "확인"}
                  </button>
              </div>
            )}
            
            {authMsg && (
                <span style={{ 
                    color: isAuthVerified ? "blue" : "red", 
                    fontSize: "12px", 
                    marginTop: "5px", 
                    display: "block" 
                }}>
                    {authMsg}
                </span>
            )}
          </div>

          {/* 2. 비밀번호 재설정 섹션 (인증 완료 시에만 보이게 하거나 항상 보이게 할 수 있음) */}
          {/* 여기서는 인증 완료 시 입력 가능하도록 처리하거나, 항상 보여주되 인증 전엔 비활성화하는 방식 등이 가능합니다. */}
          {/* 지금은 항상 보여주되, 인증 완료 전에는 입력을 막지 않고 제출 시 체크하거나,
              사용자 경험을 위해 isAuthVerified가 true일 때만 보여주는 것이 깔끔할 수 있습니다. 
              -> 아래는 인증 완료 시에만 입력창이 나타나도록 처리했습니다. */}
          
          {isAuthVerified && (
            <>
                
                <div className="form-group">
                <label className="form-label">새 비밀번호</label>
                <input type="password" 
                        className={`find-input ${isPwdValid === false || serverErrorMsg ? "input-error" : ""}`}
                        placeholder="8~16자 (영문, 숫자, 특수문자)" 
                        value={newPassword} onChange={handlePasswordChange} />
                
                {isPwdValid === false && <span className="error-msg">올바른 비밀번호 형식이 아닙니다</span>}
                {serverErrorMsg && <span className="error-msg">{serverErrorMsg}</span>}
                </div>
                <div className="form-group">
                <label className="form-label">새 비밀번호 확인</label>
                <input type="password" 
                        className={`find-input ${isPwdMatch === false ? "input-error" : ""}`}
                        placeholder="비밀번호를 다시 입력해 주세요." 
                        value={confirmPassword} onChange={handleConfirmChange} />
                {isPwdMatch === false && <span className="error-msg">비밀번호가 일치하지 않습니다</span>}
                </div>
                <button className="btn-submit" onClick={handleSubmitChange}>
                비밀번호 변경 완료
                </button>
            </>
          )}
        </div>
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default FindPasswordPage;
=======
export default FindPasswordPage;
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
