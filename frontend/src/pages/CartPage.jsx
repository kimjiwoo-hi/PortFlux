import React, { useEffect, useState, useCallback } from "react";
import { getCart, createOrder, removeFromCart, updateCartQuantity } from "../api/api";
import CheckoutModal from "../components/CheckoutModal";

// TODO: 임시 사용자 ID. 실제 프로덕션에서는 로그인 및 인증을 통해 동적으로 받아와야 합니다.
const TEMP_USER_ID = 1;

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setError(null);
      const res = await getCart(TEMP_USER_ID);
      // 백엔드에서 { items: [...], totalAmount: ... } 형식으로 반환
      const data = res && res.data ? res.data : { items: [], totalAmount: 0 };
      setCart({ 
        items: data.items || [], 
        total: data.totalAmount ?? 0 
      });
    } catch (e) {
      console.error(e);
      setError("장바구니 정보를 불러오는데 실패했습니다.");
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (cartId, newQty) => {
    const originalQty = cart.items.find(item => item.cartId === cartId)?.qty;
    
    if (newQty <= 0) {
      // 수량이 0 이하면 삭제 처리
      await handleRemove(cartId);
      return;
    }

    if (newQty === originalQty) return; // 수량 변경이 없으면 아무것도 하지 않음

    try {
      await updateCartQuantity(cartId, newQty);
      // 성공 시 장바구니 정보 다시 로드
      await fetchCart();
    } catch (e) {
      console.error(e);
      alert("수량 변경에 실패했습니다.");
    }
  };

  const handleRemove = async (cartId) => {
    if (!window.confirm("정말로 이 상품을 삭제하시겠습니까?")) return;

    try {
      await removeFromCart(cartId);
      // 성공 시 장바구니 정보 다시 로드
      await fetchCart();
    } catch (e) {
      console.error(e);
      alert("상품 삭제에 실패했습니다.");
    }
  };

  const handleCheckout = async () => {
    const payload = {
      userId: TEMP_USER_ID,
      items: cart.items.map((it) => ({
        postId: it.postId,
        qty: it.qty,
      })),
    };

    try {
      const res = await createOrder(payload);
      const data = res.data;
      setCheckoutInfo({ merchantUid: data.merchantUid, amount: data.amount, orderId: data.orderId });
    } catch (err) {
      console.error(err);
      alert("주문 생성에 실패했습니다.");
    }
  };

  if (error) {
    return <div className="cart-page"><p>{error}</p></div>;
  }

  return (
    <div className="cart-page">
      <h2>장바구니</h2>
      <ul>
        {cart.items && cart.items.length > 0 ? (
          cart.items.map((it) => (
            <li key={it.cartId}>
              <span>{it.productName} (단가: {it.unitPrice.toLocaleString()}원)</span>
              <div>
                <input
                  type="number"
                  min="1"
                  defaultValue={it.qty}
                  onBlur={(e) => handleUpdateQuantity(it.cartId, parseInt(e.target.value, 10))}
                  style={{ width: "50px", marginRight: "10px" }}
                />
                <button onClick={() => handleRemove(it.cartId)}>삭제</button>
              </div>
            </li>
          ))
        ) : (
          <li>장바구니가 비어있습니다.</li>
        )}
      </ul>
      <div className="summary">총 합계: {cart.total.toLocaleString()}원</div>
      <button onClick={handleCheckout} disabled={!cart.items || cart.items.length === 0}>
        결제하러 가기
      </button>

      {checkoutInfo && (
        <CheckoutModal
          merchantUid={checkoutInfo.merchantUid}
          amount={checkoutInfo.amount}
          orderId={checkoutInfo.orderId}
          onClose={() => setCheckoutInfo(null)}
        />
      )}
    </div>
  );
}
