import React from "react";
import { useNavigate } from "react-router-dom";
import { confirmPayment } from "../api/api";
import "./CheckoutModal.css";

function loadIamportScript() {
  return new Promise((resolve, reject) => {
    if (window.IMP) return resolve(window.IMP);
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    script.onload = () => resolve(window.IMP);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function CheckoutModal({ merchantUid, amount, orderId, onClose }) {
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      const IMP = await loadIamportScript();
      const impKey = import.meta.env.VITE_IMP_KEY || "imp00000000";
      IMP.init(impKey);

      IMP.request_pay(
        {
          pg: "html5_inicis",
          merchant_uid: merchantUid,
          name: `Order-${orderId}`,
          amount: Number(amount),
        },
        async (rsp) => {
          if (rsp.success) {
            try {
              const paymentRes = await confirmPayment({
                impUid: rsp.imp_uid,
                merchantUid: merchantUid,
                amount: Number(amount),
              });

              navigate(
                `/order-result?status=success&orderId=${orderId}&paymentId=${paymentRes.data.paymentId}&amount=${amount}&message=결제가 정상 처리되었습니다.`
              );
              onClose();
            } catch (e) {
              console.error(e);
              navigate(
                `/order-result?status=failed&orderId=${orderId}&message=결제 검증 실패`
              );
              onClose();
            }
          } else {
            navigate(
              `/order-result?status=failed&orderId=${orderId}&message=${rsp.error_msg}`
            );
            onClose();
          }
        }
      );
    } catch (e) {
      console.error(e);
      alert("아임포트 스크립트 로드에 실패했습니다.");
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
