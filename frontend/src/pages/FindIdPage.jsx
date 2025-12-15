import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FindPage.css";

function FindIdPage() {
  const navigate = useNavigate();

  // [수정] step, foundId 상태 삭제됨 (더 이상 필요 없음)

  // 입력값
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [inputCode, setInputCode] = useState("");

  // 인증 관련 상태
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // 메시지
  const [emailMsg, setEmailMsg] = useState("");       
  const [isEmailError, setIsEmailError] = useState(false); 
  const [codeMsg, setCodeMsg] = useState(""); 
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    
    // 입력 수정 시 기존 인증 상태 초기화
    setIsCodeSent(false);
    setIsVerified(false);
    setCodeMsg("");
    setInputCode("");

    if (val.length === 0) {
      setEmailMsg("");
      return;
    }

    if (!emailRegex.test(val)) {
      setEmailMsg("이메일 형식이 올바르지 않습니다");
      setIsEmailError(true);
    } else {
      setEmailMsg("사용 가능한 이메일 형식입니다");
      setIsEmailError(false);
    }
  };

  const handleSendCode = async () => {
    if (!name || !email) return; 
    if (!emailRegex.test(email)) return;

    try {
      const res = await fetch("http://localhost:8080/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      if (res.ok) {
        setIsCodeSent(true);
        setEmailMsg("인증번호가 발송되었습니다");
        setIsEmailError(false);
      } else {
        console.error("메일 발송 실패");
        setEmailMsg("가입되지 않은 이메일입니다");
        setIsEmailError(true);
      }
    } catch (e) {
      console.error("서버 연결 실패", e);
      setEmailMsg("서버 오류가 발생했습니다");
      setIsEmailError(true);
    }
  };

  const handleVerify = async () => {
    if (!inputCode) return;

    try {
      const res = await fetch("http://localhost:8080/api/mail/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, authCode: inputCode }),
      });

      if (res.ok) {
        const isSuccess = await res.json();
        if (isSuccess) {
          setIsVerified(true);
          setCodeMsg("인증이 완료되었습니다");
        } else {
          setCodeMsg("인증번호가 일치하지 않습니다");
        }
      }
    } catch (e) {
      console.error("서버 연결 실패", e);
    }
  };

  const handleNext = async () => {
    if (!isVerified) return;
    try {
      const res = await fetch("http://localhost:8080/user/find/id", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name, email: email }),
      });

      if (res.ok) {
        const resultId = await res.text(); 
        
        // 성공 시 SuccessPage로 이동
        navigate("/success", { 
            state: { 
                message: "회원님의 정보와 일치하는 아이디입니다",
                data: resultId 
            } 
        });

      } else {
        console.error(await res.text());
      }
    } catch (e) {
      console.error("오류 발생", e);
    }
  };

  return (
    <div className="find-wrapper">
      <div className="find-box">
        <h2 className="find-title">아이디 찾기</h2>

        {/* [수정] step 조건문 제거함 (항상 입력 폼 표시) */}
        <div className="form-container">
          <div className="form-group">
            <label className="form-label">이름</label>
            <input
              type="text"
              className="find-input"
              placeholder="이름을 입력해 주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isVerified} 
              disabled={isVerified} 
              style={{ backgroundColor: isVerified ? "#f5f5f5" : "#fff" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">이메일</label>
            <div className="input-with-btn">
              <input
                type="text"
                className={`find-input ${isEmailError ? "input-error" : ""}`}
                placeholder="이메일을 입력해 주세요"
                value={email}
                onChange={handleEmailChange}
                readOnly={isVerified}
                disabled={isVerified}
                style={{ backgroundColor: isVerified ? "#f5f5f5" : "#fff" }}
              />
              <button 
                className="btn-small" 
                onClick={handleSendCode}
                disabled={isVerified}
              >
                {isCodeSent ? "재전송" : "인증번호"}
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
          </div>

          {isCodeSent && (
            <div className="form-group">
              <label className="form-label">인증번호</label>
              <div className="input-with-btn">
                <input
                  type="text"
                  className="find-input"
                  placeholder="인증번호 6자리"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  readOnly={isVerified}
                  disabled={isVerified}
                  maxLength={6}
                  style={{ backgroundColor: isVerified ? "#f5f5f5" : "#fff" }}
                />
                <button 
                  className="btn-small" 
                  onClick={handleVerify}
                  disabled={isVerified}
                >
                  {isVerified ? "인증완료" : "인증하기"}
                </button>
              </div>
              
              {codeMsg && (
                  <span style={{ 
                      color: isVerified ? "blue" : "red", 
                      fontSize: "12px", 
                      marginTop: "5px", 
                      display: "block" 
                  }}>
                    {codeMsg}
                  </span>
              )}
            </div>
          )}

          <button className="btn-submit" onClick={handleNext}>
            다음
          </button>
        </div>
      </div>
    </div>
  );
}

export default FindIdPage;