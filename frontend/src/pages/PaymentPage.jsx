import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CheckoutPage.css"; // CheckoutPage.css 재사용 (혹은 PaymentPage.css로 새로 생성)

function PaymentPage() {
  const { state } = useLocation(); // merchantUid를 state로 받음
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState("card"); // 기본 결제 수단: 신용카드
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const merchantUid = state?.merchantUid; // useLocation().state에서 merchantUid 추출

  useEffect(() => {
    if (typeof window.IMP === "undefined") {
      alert("결제 모듈을 불러오지 못했습니다. 다시 시도해주세요.");
      navigate("/cart");
      return;
    }

    if (!merchantUid) {
      setError("잘못된 접근입니다. 주문 정보가 없습니다.");
      setLoading(false);
      return;
    }

    const fetchOrderInfo = async () => {
      try {
        // 백엔드에서 merchant_uid로 주문 정보 조회 (PaymentService에서 사용되는 API와는 다름)
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.get(`/api/orders/${merchantUid}`, {
          withCredentials: true,
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setOrderInfo(response.data);
        setLoading(false);
      } catch (err) {
        console.error("주문 정보 조회 실패:", err);
        setError("주문 정보를 불러오는 데 실패했습니다.");
        setLoading(false);
        navigate("/cart"); // 에러 발생 시 장바구니로 돌려보냄
      }
    };

    fetchOrderInfo();
  }, [merchantUid, navigate]);

  const handlePayment = () => {
    if (!orderInfo) {
      alert("주문 정보가 유효하지 않습니다.");
      return;
    }

    const { IMP } = window;
    const impKey = import.meta.env.VITE_IMP_KEY || "imp77508670";
    IMP.init(impKey);

    // 결제수단별 Channel Key 설정 (포트원 V1 최신 방식)
    const getChannelKey = () => {
      switch (payMethod) {
        case "kakaopay":
          return "channel-key-5acc4805-406d-4644-b2d0-3bf69d7ddfa5"; // 카카오페이
        case "tosspay":
        case "naverpay":
        case "payco":
          return "channel-key-1a093847-6a4b-4cdf-bd11-78b638b4c4c6"; // 토스페이먼츠 (간편결제 통합)
        case "card":
        default:
          return "channel-key-ab9ad1a7-935e-4e7a-b193-f1a407168af1"; // 이니시스 신용카드
      }
    };

    const paymentData = {
      channelKey: getChannelKey(), // V1 최신 방식: channelKey 사용
      pay_method: payMethod, // 각 결제 수단의 실제 값 사용 (card, kakaopay, tosspay, naverpay, payco)
      merchant_uid: orderInfo.merchantUid,
      name: orderInfo.items.length > 1 ? `${orderInfo.items[0].productName} 외 ${orderInfo.items.length - 1}건` : orderInfo.items[0].productName,
      amount: orderInfo.totalAmount,
      buyer_email: orderInfo.buyerEmail,
      buyer_name: orderInfo.buyerName,
      buyer_tel: orderInfo.buyerTel,
      m_redirect_url: `${window.location.origin}/order-result`, // 모바일 결제 시 리다이렉트 될 주소
    };

    IMP.request_pay(paymentData, async (response) => {
      // 결제 실패 시 조기 반환 (공식 문서 권장 방식)
      if (response.error_code != null) {
        alert(`결제에 실패하였습니다. 에러 내용: ${response.error_msg}`);
        navigate("/cart");
        return;
      }

      // 결제 성공 - 백엔드 검증 진행
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        // 백엔드에 결제 검증 요청
        await axios.post(
          "/api/payments/confirm",
          {
            impUid: response.imp_uid,
            merchantUid: response.merchant_uid,
          },
          {
            withCredentials: true,
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        // 장바구니 비우기 (검증 성공 후)
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
            // 장바구니 비우기 실패해도 결제는 완료되었으므로 진행
          }
        }

        // 주문 완료 페이지로 이동
        navigate(`/order-result?merchant_uid=${response.merchant_uid}`);

      } catch (err) {
        console.error("결제 검증 실패:", err);
        alert(`결제 검증에 실패했습니다. 결제는 완료되었으나 서버 처리 중 문제가 발생했습니다.\n고객센터로 문의해주세요.`);
        // 결제는 완료되었으므로 주문 결과 페이지로 이동하여 상황 안내
        navigate(`/order-result?merchant_uid=${response.merchant_uid}`);
      }
    });
  };
  
  if (loading) return <div>주문 정보를 불러오는 중...</div>;
  if (error) return <div className="error-container">오류: {error}</div>;
  if (!orderInfo) return <div className="error-container">주문 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="checkout-page"> {/* CheckoutPage.css의 스타일을 활용 */}
      <div className="checkout-container">
        <h1>결제하기</h1>
        <div className="order-summary">
          <h2>주문 정보</h2>
          {orderInfo.items.map((item, index) => (
            <div key={item.productId || index} className="order-item">
              <span>{item.productName}</span>
              <span>{item.unitPrice.toLocaleString()}₩</span>
            </div>
          ))}
          <div className="total-amount">
            <span>총 결제 금액</span>
            <span>{orderInfo.totalAmount.toLocaleString()}₩</span>
          </div>
        </div>

        <div className="payment-method-selection">
          <h2>결제 수단 선택</h2>
          <div className="payment-options">
            <button
              className={`payment-option-btn ${payMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPayMethod('card')}
            >
              💳 신용카드
            </button>
            <button
              className={`payment-option-btn ${payMethod === 'kakaopay' ? 'selected' : ''}`}
              onClick={() => setPayMethod('kakaopay')}
            >
              <span style={{ color: '#FEE500' }}>●</span> 카카오페이
            </button>
            {/* 토스페이먼츠 간편결제는 채널 설정 후 활성화 */}
            {/* <button
              className={`payment-option-btn ${payMethod === 'tosspay' ? 'selected' : ''}`}
              onClick={() => setPayMethod('tosspay')}
            >
              <span style={{ color: '#0064FF' }}>●</span> 토스페이
            </button>
            <button
              className={`payment-option-btn ${payMethod === 'naverpay' ? 'selected' : ''}`}
              onClick={() => setPayMethod('naverpay')}
            >
              <span style={{ color: '#03C75A' }}>●</span> 네이버페이
            </button>
            <button
              className={`payment-option-btn ${payMethod === 'payco' ? 'selected' : ''}`}
              onClick={() => setPayMethod('payco')}
            >
              <span style={{ color: '#F23030' }}>●</span> 페이코
            </button> */}
          </div>
        </div>

        <button className="btn-payment" onClick={handlePayment}>
          {orderInfo.totalAmount.toLocaleString()}₩ 결제하기
        </button>
      </div>
    </div>
  );
}

export default PaymentPage;
