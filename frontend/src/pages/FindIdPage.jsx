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
      const res = await fetch("http://localhost:8080/api/mail/send", {
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
      const res = await fetch("http://localhost:8080/api/mail/verify", {
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
      const res = await fetch("http://localhost:8080/user/find/id", {
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
            </div>

            {/* 인증번호 입력 + 인증하기 */}
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
                {/* 인증 성공 메시지 */}
                {isVerified && (
                  <span className="error-msg" style={{ color: "#3b5bdb" }}>
                    {" "}
                    {/* verified-msg 대신 error-msg 재활용 또는 인라인 */}
                    이메일 인증이 정상적으로 완료되었습니다.
                  </span>
                )}
              </div>
            )}

            {/* 다음 버튼 */}
            <button className="btn-submit" onClick={handleNext}>
              {" "}
              {/* btn-next -> btn-submit */}
              다음
            </button>
          </div>
        )}
        {/* STEP 2: 결과 확인 */}
        {step === 2 && foundId && (
          <div className="form-container">
            {" "}
            {/* result-container 대신 form-container 재활용 가능 */}
            <p className="info-text">
              {" "}
              {/* result-info-text -> info-text */}
              회원님의 정보와 일치하는 아이디입니다.
            </p>
            {/* 결과 박스 (FindPage.css에는 없으므로 인라인 스타일 혹은 추가 필요, 여기선 기존 구조 유지하되 스타일만 맞춤) */}
            <div
              style={{
                width: "100%",
                border: "1px solid #ccc",
                borderRadius: "4px",
                display: "flex",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  width: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "#333",
                  borderRight: "1px solid #ccc",
                  padding: "15px 0",
                }}
              >
                아이디
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#3b5bdb",
                  fontWeight: "600",
                }}
              >
                {foundId}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-submit"
                style={{ marginTop: 0 }}
                onClick={() => navigate("/login")}
              >
                로그인 하러가기
              </button>
              <button
                className="btn-submit"
                style={{
                  marginTop: 0,
                  backgroundColor: "#fff",
                  color: "#555",
                  border: "1px solid #ccc",
                }}
                onClick={() => navigate("/findpassword")} // 경로 소문자로 수정
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
