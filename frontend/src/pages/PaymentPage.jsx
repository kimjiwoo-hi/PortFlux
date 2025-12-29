import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CheckoutPage.css"; // CheckoutPage.css 재사용 (혹은 PaymentPage.css로 새로 생성)

function PaymentPage() {
  const { state } = useLocation(); // merchantUid를 state로 받음
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState("html5_inicis"); // 기본 결제 수단: 신용카드
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
        const response = await axios.get(`http://localhost:8080/api/orders/${merchantUid}`, {
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
    IMP.init("imp77508670"); // TODO: 실제 아임포트 가맹점 식별코드로 변경하세요.

    const paymentData = {
      pg: payMethod === "kakaopay" ? "kakaopay" : "html5_inicis", // 카카오페이 PG사 설정
      pay_method: "card", // 신용카드 결제 (카카오페이는 pg 설정 시 override됨)
      merchant_uid: orderInfo.merchantUid,
      name: orderInfo.items.length > 1 ? `${orderInfo.items[0].productName} 외 ${orderInfo.items.length - 1}건` : orderInfo.items[0].productName,
      amount: orderInfo.totalAmount,
      buyer_email: orderInfo.buyerEmail,
      buyer_name: orderInfo.buyerName,
      buyer_tel: orderInfo.buyerTel,
      m_redirect_url: `http://localhost:5173/order-result`, // 모바일 결제 시 리다이렉트 될 주소
    };

    IMP.request_pay(paymentData, async (rsp) => {
      if (rsp.success) {
        try {
          // 결제 성공 시, 백엔드에 결제 검증 요청 (우리가 수정한 /api/payments/confirm)
          await axios.post(
            "http://localhost:8080/api/payments/confirm",
            {
              impUid: rsp.imp_uid,
              merchantUid: rsp.merchant_uid,
            },
            {
              headers: { 'Authorization': `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}` }
            }
          );
          
          // 검증 성공 후 결과 페이지로 이동
          navigate(`/order-result?merchant_uid=${rsp.merchant_uid}`);

          // 장바구니 비우기 (결제 성공 및 검증 완료 후)
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            await axios.delete(
                `http://localhost:8080/api/cart/${user.userNum}/empty`, // 백엔드에 장바구니 비우기 API가 필요함
                { withCredentials: true, headers: { 'Authorization': `Bearer ${token}` } }
            ).then(() => {
                console.log("장바구니 비우기 성공");
            }).catch(err => {
                console.error("장바구니 비우기 실패:", err);
            });
          }

        } catch (err) {
          console.error("결제 검증 실패:", err);
          alert(`결제 검증에 실패했습니다. 문제가 지속될 경우 고객센터로 문의해주세요.`);
          // TODO: 결제는 성공했으나 검증이 실패한 경우, 사용자에게 안내하고 서버에 해당 내용을 로깅하는 등의 후처리 필요
          navigate(`/order-result?merchant_uid=${rsp.merchant_uid}`); // 일단 결과 페이지로 보내서 사용자에게 상황을 알림
        }
      } else {
        alert(`결제에 실패했습니다: ${rsp.error_msg}`);
        navigate("/cart"); // 결제 실패 시 장바구니로 돌아감
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
              className={`payment-option-btn ${selectedPg === 'html5_inicis' ? 'selected' : ''}`}
              onClick={() => setSelectedPg('html5_inicis')}
            >
              신용카드
            </button>
            <button
              className={`payment-option-btn ${selectedPg === 'kakaopay' ? 'selected' : ''}`}
              onClick={() => setSelectedPg('kakaopay')}
            >
              카카오페이
            </button>
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
