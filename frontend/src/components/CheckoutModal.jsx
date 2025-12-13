import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { confirmPayment } from "../api/api";
import "./CheckoutModal.css";

// PortOne v2 SDK 로드 함수
function loadPortOneScript() {
  return new Promise((resolve, reject) => {
    if (window.PortOne) {
      return resolve(window.PortOne);
    }
    const script = document.createElement("script");
    script.src = "https://cdn.portone.cloud/browser-sdk/v2/portone.js";
    script.onload = () => resolve(window.PortOne);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function CheckoutModal({ merchantUid, amount, orderId, onClose }) {
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 스크립트를 미리 로드합니다.
  useEffect(() => {
    loadPortOneScript().catch((error) =>
      console.error("PortOne SDK load failed:", error)
    );
  }, []);

  const handlePayment = async () => {
    try {
      const PortOne = await loadPortOneScript();
      
      // .env 파일에서 스토어 ID와 채널 키를 가져옵니다.
      // VITE_PORTONE_STORE_ID 와 VITE_PORTONE_CHANNEL_KEY 가 .env 파일에 설정되어 있어야 합니다.
      const storeId = import.meta.env.VITE_PORTONE_STORE_ID;
      const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY; // PG 연동 시 채널 키 사용

      if (!storeId) {
        alert("PortOne 스토어 ID가 설정되지 않았습니다.");
        return;
      }

      const response = await PortOne.requestPayment({
        storeId: storeId,
        channelKey: channelKey, // Inicis와 같은 PG사를 이용하는 경우 채널 키를 사용
        orderName: `Order-${orderId}`,
        totalAmount: Number(amount),
        currency: "KRW",
        merchantUid: merchantUid,
        pg: "html5_inicis.INIpayTest", // PG사 및 테스트 모드 명시
      });

      if (response && response.paymentId) {
        // 결제 성공 후 백엔드에 검증 요청
        const paymentRes = await confirmPayment({
          paymentId: response.paymentId,
          orderId: orderId,
          amount: Number(amount),
        });

        navigate(
          `/order-result?status=success&orderId=${orderId}&paymentId=${paymentRes.data.paymentId}&amount=${amount}&message=결제가 정상 처리되었습니다.`
        );
        onClose();
      } else {
        // 사용자가 결제를 취소했거나, 결제에 실패한 경우
        const errorMessage = response ? response.message : "알 수 없는 오류";
        navigate(
          `/order-result?status=failed&orderId=${orderId}&message=${errorMessage}`
        );
        onClose();
      }
    } catch (error) {
      console.error("결제 처리 중 오류가 발생했습니다.", error);
      navigate(
        `/order-result?status=failed&orderId=${orderId}&message=결제 시스템 오류`
      );
      onClose();
    }
  };

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2>결제 확인</h2>

        <div className="checkout-info">
          <div className="info-row">
            <span className="label">주문번호:</span>
            <span className="value">{merchantUid}</span>
          </div>
          <div className="info-row">
            <span className="label">결제금액:</span>
            <span className="value">{Number(amount).toLocaleString()}원</span>
          </div>
        </div>

        <div className="checkout-actions">
          <button className="btn btn-primary" onClick={handlePayment}>
            결제 진행
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
