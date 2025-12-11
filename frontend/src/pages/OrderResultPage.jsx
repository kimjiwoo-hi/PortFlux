import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./OrderResultPage.css";

export default function OrderResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const merchantUid = searchParams.get("merchant_uid"); // 필수
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchResult = useCallback(async (signal) => {
    if (!merchantUid) {
      setErr("잘못된 접근입니다. (merchant_uid 누락)");
      setLoading(false);
      return;
    }
    try {
      // 서버가 확정한 주문/결제 결과만 신뢰
      const r = await fetch(
        `/api/payments/result?merchantUid=${encodeURIComponent(merchantUid)}`,
        { signal }
      );
      if (!r.ok) throw new Error(`서버 오류 (${r.status})`);
      const data = await r.json();
      // 기대 응답 예시:
      // { status: "PAID"|"PENDING"|"FAILED"|"CANCELLED",
      //   orderId, paymentId, amount, message }
      setResult({
        status: (data.status || "UNKNOWN").toLowerCase(), // paid/pending/failed/cancelled
        orderId: data.orderId ?? "N/A",
        paymentId: data.paymentId ?? "N/A",
        amount: Number(data.amount || 0),
        message: data.message || "",
      });
      setLoading(false);
    } catch (e) {
      if (e.name !== "AbortError") {
        setErr(e.message || "결과 조회 중 오류가 발생했습니다.");
        setLoading(false);
      }
    }
  }, [merchantUid]);

  useEffect(() => {
    const ac = new AbortController();

    // 첫 조회
    fetchResult(ac.signal);

    // 웹훅 반영 지연 대비: PENDING이면 몇 번 재시도(예: 5회)
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      if (tries > 5) {
        clearInterval(timer);
        return;
      }
      // 아직 로딩 중이면 첫 fetch 결과를 기다림
      if (loading) return;
      if (result && result.status === "pending") {
        setLoading(true);
        await fetchResult(ac.signal);
      } else {
        clearInterval(timer);
      }
    }, 1200);

    return () => {
      ac.abort();
      clearInterval(timer);
    };
  }, [fetchResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBackToCart = () => navigate("/cart");
  const handleBackToHome = () => navigate("/");

  if (!merchantUid) {
    return <div className="result-container">잘못된 접근입니다. (merchant_uid 없음)</div>;
  }
  if (loading) {
    return <div className="result-container">결제 결과 확인 중…</div>;
  }
  if (err) {
    return (
      <div className="result-container">
        <div className="result-card failed">
          <div className="result-icon"><span className="icon-failed">✕</span></div>
          <h1 className="result-title">결과 조회 실패</h1>
          <p className="result-message">{err}</p>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={handleBackToCart}>장바구니로 돌아가기</button>
            <button className="btn btn-secondary" onClick={handleBackToHome}>홈으로 가기</button>
          </div>
        </div>
      </div>
    );
  }
  if (!result) {
    return <div className="result-container">결과를 불러올 수 없습니다.</div>;
  }

  const isSuccess = result.status === "paid";
  const isPending = result.status === "pending";

  return (
    <div className="result-container">
      <div className={`result-card ${isSuccess ? "success" : isPending ? "pending" : "failed"}`}>
        <div className="result-icon">
          {isSuccess ? <span className="icon-success">✓</span>
            : isPending ? <span className="icon-pending">…</span>
            : <span className="icon-failed">✕</span>}
        </div>

        <h1 className="result-title">
          {isSuccess ? "결제 성공"
            : isPending ? "결제 확인 중"
            : "결제 실패"}
        </h1>

        <p className="result-message">
          {isSuccess
            ? "주문이 정상적으로 접수되었습니다."
            : isPending
              ? "결제 확인 중입니다. 잠시만 기다려 주세요."
              : "결제 처리 중 문제가 발생했습니다."}
        </p>

        <div className="result-details">
          <div className="detail-item">
            <span className="detail-label">주문번호:</span>
            <span className="detail-value">{result.orderId}</span>
          </div>
          {isSuccess && (
            <>
              <div className="detail-item">
                <span className="detail-label">결제번호:</span>
                <span className="detail-value">{result.paymentId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">결제금액:</span>
                <span className="detail-value">
                  {Number(result.amount || 0).toLocaleString()}원
                </span>
              </div>
            </>
          )}
          {result.message && (
            <div className="detail-item">
              <span className="detail-label">안내:</span>
              <span className="detail-value">{result.message}</span>
            </div>
          )}
        </div>

        <div className="result-actions">
          {isSuccess ? (
            <>
              <button className="btn btn-primary" onClick={handleBackToHome}>홈으로 돌아가기</button>
              <button className="btn btn-secondary" onClick={handleBackToCart}>장바구니로 가기</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleBackToCart}>장바구니로 돌아가기</button>
              <button className="btn btn-secondary" onClick={handleBackToHome}>홈으로 가기</button>
            </>
          )}
        </div>

        {isSuccess && (
          <div className="result-footer">
            <p>📧 결제 영수증이 이메일로 발송되었습니다.</p>
            <p>❓ 문의사항이 있으시면 <a href="mailto:support@portflux.com">고객센터</a>로 연락주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
