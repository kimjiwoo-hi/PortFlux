import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FindPage.css"; // ★ [수정 1] 통합된 CSS 파일 임포트

function FindIdPage() {
  const navigate = useNavigate();

  // === 상태 관리 ===
  const [step, setStep] = useState(1); // step 1: 입력 및 인증, step 2: 결과 확인

  // 입력값
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inputCode, setInputCode] = useState("");

  // 인증 관련 상태
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // 결과 아이디
  const [foundId, setFoundId] = useState(null);

  // 이메일 정규식
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // === 핸들러: 인증번호 받기 ===
  const handleSendCode = async () => {
    if (!name || !email) {
      alert("이름과 이메일을 모두 입력해 주세요.");
      return;
    }
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      if (res.ok) {
        alert("이메일로 인증번호가 발송되었습니다.");
        setIsCodeSent(true);
      } else {
        alert("메일 발송 실패: 잠시 후 다시 시도해주세요.");
      }
    } catch (e) {
      console.error(e);
      alert("서버 연결 실패");
    }
  };

  // === 핸들러: 인증하기 ===
  const handleVerify = async () => {
    if (!inputCode) {
      alert("인증번호를 입력해 주세요.");
      return;
    }

    try {
      const res = await fetch("/api/mail/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, authCode: inputCode }),
      });

      if (res.ok) {
        const isSuccess = await res.json();
        if (isSuccess) {
          setIsVerified(true);
          alert("인증이 완료되었습니다.");
        } else {
          alert("인증번호가 일치하지 않습니다.");
        }
      } else {
        alert("인증 확인 중 오류가 발생했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("서버 연결 실패");
    }
  };

  // === 핸들러: 다음 버튼 (아이디 찾기 요청) ===
  const handleNext = async () => {
    if (!isVerified) {
      alert("이메일 인증을 완료해 주세요.");
      return;
    }

    try {
      const res = await fetch("/api/user/find/id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email }),
      });

      if (res.ok) {
        const resultId = await res.text();
        setFoundId(resultId);
        setStep(2);
      } else {
        const errorMsg = await res.text();
        alert(errorMsg);
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="find-wrapper">
      {" "}
      {/* ★ [수정 2] 클래스명 변경 (find-id-wrapper -> find-wrapper) */}
      <div className="find-box">
        {" "}
        {/* ★ [수정 3] 클래스명 변경 (find-id-box -> find-box) */}
        <h2 className="find-title">아이디 찾기</h2>{" "}
        {/* ★ [수정 4] 클래스명 변경 */}
        {/* STEP 1: 정보 입력 및 인증 */}
        {step === 1 && (
          <div className="form-container">
            {/* 이름 입력 */}
            <div className="form-group">
              <label className="form-label">이름</label>
              <input
                type="text"
                className="find-input"
                placeholder="이름을 입력해 주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={isVerified}
                style={{ backgroundColor: isVerified ? "#f5f5f5" : "#fff" }}
              />
            </div>

            {/* 이메일 입력 + 인증번호 받기 */}
            <div className="form-group">
              <label className="form-label">이메일</label>
              <div className="input-with-btn">
                <input
                  type="text"
                  className="find-input"
                  placeholder="이메일을 입력해 주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={isVerified}
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

              {/* 인증번호 입력 - 이메일 아래에 바로 표시 (비밀번호 찾기 페이지처럼) */}
              {isCodeSent && (
                <div className="input-with-btn" style={{ marginTop: "10px" }}>
                  <input
                    type="text"
                    className="find-input"
                    placeholder="인증번호 6자리"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    readOnly={isVerified}
                    maxLength={6}
                    style={{ backgroundColor: isVerified ? "#f5f5f5" : "#fff" }}
                  />
                  <button
                    className="btn-small"
                    onClick={handleVerify}
                    disabled={isVerified}
                  >
                    {isVerified ? "완료" : "확인"}
                  </button>
                </div>
              )}

              {/* 인증 성공 메시지 */}
              {isVerified && (
                <span className="error-msg" style={{ color: "#3b5bdb" }}>
                  이메일 인증이 정상적으로 완료되었습니다.
                </span>
              )}
            </div>

            {/* 다음 버튼 */}
            <button
              className="btn-submit"
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#3b5bdb',
                background: '#3b5bdb',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              다음
            </button>
          </div>
        )}
        {/* STEP 2: 결과 확인 */}
        {step === 2 && foundId && (
          <div className="form-container">
            <p className="info-text">
              회원님의 정보와 일치하는 아이디입니다.
            </p>
            <div className="result-box">
              <div className="result-label">아이디</div>
              <div className="result-value">{foundId}</div>
            </div>
            <div className="btn-group">
              <button
                className="btn-submit"
                onClick={() => navigate("/login")}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#3b5bdb',
                  background: '#3b5bdb',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                로그인 하러가기
              </button>
              <button
                className="btn-submit btn-secondary"
                onClick={() => navigate("/findpassword")}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#3b5bdb',
                  background: '#3b5bdb',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                비밀번호 찾기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindIdPage;
