import React, { useEffect, useState } from "react";
import { getCart, createOrder } from "../api/api";
import CheckoutModal from "../components/CheckoutModal";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [checkoutInfo, setCheckoutInfo] = useState(null);

  useEffect(() => {
    // TODO: 실제 API 경로에 맞춰 호출합니다. 현재 예시는 /api/cart가 필요합니다.
    getCart()
      .then((res) => setCart(res.data))
      .catch((e) => console.error(e));
  }, []);

  const handleCheckout = async () => {
    // 예시: userId는 임시로 1 사용. 실제로는 로그인 유저 id 사용
    const payload = {
      userId: 1,
      items: cart.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        unitPrice: it.unitPrice,
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

  return (
    <div className="cart-page">
      <h2>장바구니</h2>
      <ul>
        {cart.items && cart.items.length > 0 ? (
          cart.items.map((it) => (
            <li key={it.productId}>
              {it.productName} - {it.qty} x {it.unitPrice}
            </li>
          ))
        ) : (
          <li>장바구니가 비어있습니다.</li>
        )}
      </ul>
      <div className="summary">총 합계: {cart.total}</div>
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
