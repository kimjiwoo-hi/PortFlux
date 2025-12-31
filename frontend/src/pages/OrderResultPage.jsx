import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrderResultPage.css";

export default function OrderResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 쿼리 파라미터 추출 (모바일 리다이렉트 지원)
  const merchantUid = searchParams.get("merchant_uid");
  const impUid = searchParams.get("imp_uid");
  const errorCode = searchParams.get("error_code");
  const errorMsg = searchParams.get("error_msg");

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handlePaymentResult = async () => {
      // 1. 결제 실패 체크 (모바일 리다이렉트 시 error_code 존재)
      if (errorCode) {
        console.error("결제 실패:", errorCode, errorMsg);
        setError(`결제에 실패하였습니다. ${errorMsg || "알 수 없는 오류"}`);
        setLoading(false);
        return;
      }

      // 2. merchant_uid 필수 체크
      if (!merchantUid) {
        setError("잘못된 접근입니다. 주문번호가 없습니다.");
        setLoading(false);
        return;
      }

      try {
        // 3. 모바일 리다이렉트로 온 경우 (imp_uid 존재) → 백엔드 검증 필요
        if (impUid) {
          console.log("모바일 결제 리다이렉트 감지: imp_uid =", impUid);

          const token = localStorage.getItem("token") || sessionStorage.getItem("token");

          try {
            // 백엔드 결제 검증 요청
            await axios.post(
              "/api/payments/confirm",
              {
                impUid: impUid,
                merchantUid: merchantUid,
              },
              {
                withCredentials: true,
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );
            console.log("모바일 결제 검증 성공");

            // 장바구니 비우기
            const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (storedUser) {
              const user = JSON.parse(storedUser);
              try {
                await axios.delete(
                  `/api/cart/${user.userNum}/empty`,
                  {
                    withCredentials: true,
                    headers: { 'Authorization': `Bearer ${token}` }
                  }
                );
                console.log("장바구니 비우기 성공");
              } catch (err) {
                console.error("장바구니 비우기 실패:", err);
              }
            }
          } catch (err) {
            console.error("모바일 결제 검증 실패:", err);
            // 검증 실패해도 주문 정보는 표시 (사용자 안내용)
          }
        }

        // 4. 주문 결과 조회
        const response = await axios.get(
          `/api/payments/result?merchantUid=${encodeURIComponent(merchantUid)}`,
          { withCredentials: true }
        );

        console.log("주문 결과:", response.data);
        setOrderData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("주문 조회 실패:", err);
        setError("주문 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    handlePaymentResult();
  }, [merchantUid, impUid, errorCode, errorMsg]);

  if (loading) {
    return (
      <div className="order-result-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>주문 정보를 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-result-page">
        <div className="result-container error">
          <div className="icon-container error-icon">✕</div>
          <h1>오류 발생</h1>
          <p className="error-message">{error}</p>
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate("/")}>
              홈으로 가기
            </button>
            <button className="btn-secondary" onClick={() => navigate("/cart")}>
              장바구니로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = orderData?.status === "CREATED" || orderData?.status === "PAID";

  return (
    <div className="order-result-page">
      <div className={`result-container ${isSuccess ? "success" : "failed"}`}>
        <div className={`icon-container ${isSuccess ? "success-icon" : "failed-icon"}`}>
          {isSuccess ? "✓" : "✕"}
        </div>

        <h1>{isSuccess ? "주문이 완료되었습니다!" : "주문 처리 실패"}</h1>

        <p className="result-message">
          {isSuccess
            ? "주문이 성공적으로 접수되었습니다. 감사합니다!"
            : "주문 처리 중 문제가 발생했습니다."}
        </p>

        <div className="order-details">
          <div className="detail-row">
            <span className="detail-label">주문번호</span>
            <span className="detail-value">{orderData?.orderId || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">주문 상태</span>
            <span className="detail-value status-badge">
              {orderData?.status === "CREATED" ? "주문 생성" : orderData?.status}
            </span>
          </div>
          <div className="detail-row total">
            <span className="detail-label">총 결제 금액</span>
            <span className="detail-value price">
              {(orderData?.amount || 0).toLocaleString()}₩
            </span>
          </div>
        </div>

        {orderData?.message && (
          <div className="info-message">
            <p>{orderData.message}</p>
          </div>
        )}

        <div className="action-buttons">
          {isSuccess ? (
            <>
              <button className="btn-primary" onClick={() => navigate("/")}>
                계속 쇼핑하기
              </button>
              <button className="btn-secondary" onClick={() => navigate("/order-list")}>
                주문 내역
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => navigate("/cart")}>
                장바구니로 돌아가기
              </button>
              <button className="btn-secondary" onClick={() => navigate("/")}>
                홈으로 가기
              </button>
            </>
          )}
        </div>

        {isSuccess && (
          <div className="footer-note">
            <p>💬 문의사항이 있으시면 고객센터로 연락주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
