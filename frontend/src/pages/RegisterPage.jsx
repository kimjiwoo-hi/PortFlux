import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate(); 

  // 탭 상태
  const [isIndividual, setIsIndividual] = useState(true);

  // === 입력값 상태 ===
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [nickname, setNickname] = useState(""); 
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");

  // === 유효성 검사 상태 (null: 입력전, true: 정상, false: 오류) ===
  const [isBizNumValid, setIsBizNumValid] = useState(null); 
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isPwdValid, setIsPwdValid] = useState(null);
  const [isPwdMatch, setIsPwdMatch] = useState(null);

  // === 정규식 패턴 ===
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  // ★★★ [추가됨] 폼 초기화 함수 (탭 전환 시 사용) ★★★
  const resetForm = () => {
    // 1. 입력값 초기화
    setEmail("");
    setAuthCode("");
    setPassword("");
    setPasswordCheck("");
    setNickname("");
    setPhoneNumber("");
    setBusinessNumber("");

    // 2. 유효성 검사 상태 초기화
    setIsBizNumValid(null);
    setIsEmailValid(null);
    setIsPwdValid(null);
    setIsPwdMatch(null);
  };

  // === 핸들러: 이메일 ===
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val.length === 0) setIsEmailValid(null);
    else setIsEmailValid(emailRegex.test(val));
  };

  // === 핸들러: 비밀번호 ===
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    
    if (val.length === 0) setIsPwdValid(null);
    else setIsPwdValid(passwordRegex.test(val));

    if (passwordCheck.length > 0) {
      setIsPwdMatch(val === passwordCheck);
    }
  };

  // === 핸들러: 비밀번호 확인 ===
  const handlePasswordCheckChange = (e) => {
    const val = e.target.value;
    setPasswordCheck(val);
    
    if (val.length === 0) setIsPwdMatch(null);
    else setIsPwdMatch(val === password);
  };

  // === 핸들러: 휴대전화번호 (자동 하이픈) ===
  const handlePhoneNumberChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, ""); 
    let formattedValue = "";

    if (rawValue.length <= 3) {
      formattedValue = rawValue;
    } else if (rawValue.length <= 7) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
    }

    setPhoneNumber(formattedValue);
  };

  // === 핸들러: 사업자번호 ===
  const handleBusinessNumberChange = async (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, ""); 
    let formattedValue = "";

    if (rawValue.length <= 3) {
      formattedValue = rawValue;
    } else if (rawValue.length <= 5) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else if (rawValue.length < 10) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 5)}-${rawValue.slice(5)}`;
    } else {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 5)}-${rawValue.slice(5, 10)}`;
    }

    setBusinessNumber(formattedValue);
    setIsBizNumValid(null);

    if (rawValue.length === 10) {
      try {
        const res = await fetch("http://localhost:8080/company/register/check-business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessNumber: formattedValue }),
        });
        
        if (res.ok) {
          const isValid = await res.json();
          setIsBizNumValid(isValid); 
        } else {
          setIsBizNumValid(false);
        }
      } catch (err) {
        console.error("조회 실패:", err);
        setIsBizNumValid(false);
      }
    }
  };

  // === 기타 핸들러 ===
  const handleSendAuthCode = () => {
    if (!email || !isEmailValid) { alert("올바른 이메일을 입력해 주세요."); return; }
    alert(`[${email}]로 인증코드가 발송되었습니다. (임시)`);
  };

  const handleVerifyAuthCode = () => {
    if (!authCode) { alert("인증코드를 입력해 주세요."); return; }
    alert("인증되었습니다. (임시)");
  };

  // === 회원가입 완료 요청 ===
  const handleRegister = async () => {
    if (!email || !authCode || !password || !passwordCheck || !nickname || !phoneNumber) {
      alert("모든 정보를 입력해 주세요.");
      return;
    }
    
    if (isEmailValid === false) { alert("이메일 형식을 확인해 주세요."); return; }
    if (isPwdValid === false) { alert("비밀번호 형식을 확인해 주세요."); return; }
    if (isPwdMatch === false) { alert("비밀번호가 일치하지 않습니다."); return; }

    if (!isIndividual) {
      if (isBizNumValid !== true) {
        alert("올바른 사업자등록번호를 입력하고 확인해 주세요.");
        return;
      }
    }

    const data = {
      email, password, passwordCheck, nickname, phoneNumber, authCode,
      ...( !isIndividual && { businessNumber: businessNumber } )
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
        const msg = await res.text(); 
        alert(isIndividual ? "회원가입 성공!" : "기업 회원가입 성공!");
        console.log("서버 응답:", msg);
        navigate("/login");
      } else {
        const errorMsg = await res.text();
        alert("가입 실패: " + errorMsg);
      }
    } catch (e) {
      console.error(e);
      alert("서버 연결 실패");
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-box">
        <h2 className="register-title">회원가입</h2>

        <div className="register-tabs">
          {/* ★★★ [수정됨] 탭 버튼 클릭 시 resetForm 실행 추가 ★★★ */}
          <button 
            className={`tab-btn ${isIndividual ? "active" : ""}`}
            onClick={() => {
              setIsIndividual(true);
              resetForm(); // 개인회원으로 갈 때 리셋
            }}
          >
            개인회원
          </button>
          <button 
            className={`tab-btn ${!isIndividual ? "active" : ""}`}
            onClick={() => {
              setIsIndividual(false);
              resetForm(); // 기업회원으로 갈 때 리셋
            }}
          >
            기업회원
          </button>
        </div>

        <div className="form-container">
          
          {/* [기업전용] 사업자등록번호 */}
          {!isIndividual && (
            <div className="form-group">
              <label className="form-label">사업자등록번호</label>
              <input 
                type="text" 
                className={`reg-input ${isBizNumValid === false ? "input-error" : ""}`} 
                placeholder="사업자 등록번호 10자리"
                value={businessNumber}
                onChange={handleBusinessNumberChange}
                maxLength={12} 
              />
              {isBizNumValid === true && <span className="valid-msg">사업자등록번호 확인완료.</span>}
              {isBizNumValid === false && <span className="error-msg">올바른 사업자번호가 아닙니다.</span>}
            </div>
          )}

          {/* 아이디(이메일) */}
          <div className="form-group">
            <label className="form-label">아이디</label>
            <div className="input-with-btn">
              <input 
                type="text" 
                className={`reg-input ${isEmailValid === false ? "input-error" : ""}`} 
                placeholder="이메일을 입력해 주세요."
                value={email}
                onChange={handleEmailChange}
              />
              <button className="btn-small" onClick={handleSendAuthCode}>인증코드 발송</button>
            </div>
            {isEmailValid === false && <span className="error-msg">올바르지 않은 이메일 형식입니다.</span>}

            <div className="input-with-btn">
              <input 
                type="text" 
                className="reg-input" 
                placeholder="인증코드 입력"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
              />
              <button className="btn-small" onClick={handleVerifyAuthCode}>인증하기</button>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input 
              type="password" 
              className={`reg-input ${isPwdValid === false ? "input-error" : ""}`} 
              placeholder="8~16자리/영문 대소문자, 숫자, 특수문자 조합"
              value={password}
              onChange={handlePasswordChange}
            />
            {isPwdValid === false && <span className="error-msg">올바르지 않은 비밀번호 형식입니다.</span>}

            <input 
              type="password" 
              className={`reg-input ${isPwdMatch === false ? "input-error" : ""}`} 
              placeholder="비밀번호를 재입력해 주세요."
              value={passwordCheck}
              onChange={handlePasswordCheckChange}
            />
            {isPwdMatch === false && <span className="error-msg">비밀번호가 일치하지 않습니다.</span>}
          </div>

          {/* 이름(닉네임) */}
          <div className="form-group">
            <label className="form-label">이름(닉네임)</label>
            <input 
              type="text" 
              className="reg-input" 
              placeholder="이름을 입력해 주세요."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* 휴대전화번호 */}
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

          {/* 가입 완료 버튼 */}
          <button className="btn-submit" onClick={handleRegister}>
            회원가입 완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;