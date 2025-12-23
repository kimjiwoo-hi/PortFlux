import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CartPage.css";

function CartPage() {
  // 1. 초기값은 항상 빈 배열로 설정
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 로그인 유저 정보 가져오기
  const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  const loggedData = storedUser ? JSON.parse(storedUser) : null;
  const userId = loggedData?.user?.userNum || loggedData?.userNum;

  useEffect(() => {
    if (!userId) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    // ... 기존 코드 동일

    const fetchCart = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/cart/${userId}`, {
          withCredentials: true
        });

        // ★ [수정 핵심] 서버 응답 데이터 구조 반영
        // 서버가 {"items": []} 형태로 보내므로 response.data.items를 확인해야 합니다.
        console.log("서버 응답 실제 데이터:", response.data); 
        
        const safeData = (response.data && Array.isArray(response.data.items)) 
                         ? response.data.items 
                         : [];
        
        setCartItems(safeData);

      } catch (err) {
        console.error("장바구니 로딩 실패:", err);
        setCartItems([]); 
      } finally {
        setLoading(false);
      }
    };

// ... 이하 totalAmount 계산 및 렌더링 로직 동일

    fetchCart();
  }, [userId, navigate]);

  // ★ [수정 핵심] 합계 계산 전 배열 여부 확인 (cartItems.reduce is not a function 에러 방지)
  const itemsForCalc = Array.isArray(cartItems) ? cartItems : [];
  const totalAmount = itemsForCalc.reduce((sum, item) => {
    // unitPrice나 qty가 누락되었을 경우를 대비해 0으로 처리
    const price = item.unitPrice || 0;
    const quantity = item.qty || 0;
    return sum + (price * quantity);
  }, 0);

  const handleCheckout = () => {
    navigate("/order-step"); 
  };

  if (loading) return <div className="cart-container">장바구니 확인 중...</div>;

  return (
    <div className="cart-container">
      <h2>🛒 나의 장바구니</h2>
      {cartItems.length === 0 ? (
        <div className="empty-cart">장바구니가 비어 있습니다.</div>
      ) : (
        <div className="cart-content">
          <table className="cart-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>가격</th>
                <th>수량</th>
                <th>소계</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={item.cartItemId || index}>
                  <td>{item.productName}</td>
                  <td>{(item.unitPrice || 0).toLocaleString()}원</td>
                  <td>{item.qty}</td>
                  <td>{((item.unitPrice || 0) * (item.qty || 0)).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-summary">
            <h3>총 결제 예상 금액: <span className="total-price">{totalAmount.toLocaleString()}원</span></h3>
            <button className="checkout-btn" onClick={handleCheckout}>결제하기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;