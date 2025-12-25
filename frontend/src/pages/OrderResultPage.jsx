import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrderResultPage.css";

export default function OrderResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const merchantUid = searchParams.get("merchant_uid");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderResult = async () => {
      if (!merchantUid) {
        setError("잘못된 접근입니다. 주문번호가 없습니다.");
        setLoading(false);
        return;
      }

      try {
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

    fetchOrderResult();
  }, [merchantUid]);

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
              <button className="btn-secondary" onClick={() => navigate("/mypage")}>
                마이페이지
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
