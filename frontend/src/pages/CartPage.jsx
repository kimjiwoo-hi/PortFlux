import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CartPage.css";

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!storedUser) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      // 1. 장바구니 아이템 조회
      const cartResponse = await axios.get(
        `/api/cart`,
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const items = cartResponse.data.items || [];
      console.log("장바구니 원본 데이터:", items);

      // 2. 주문 내역 조회 (구매한 상품 목록 가져오기)
      let purchasedPostIds = new Set();
      try {
        const ordersResponse = await axios.get(
          `/api/orders/user`,
          {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // 주문 내역에서 구매한 모든 postId 추출
        ordersResponse.data.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(orderItem => {
              purchasedPostIds.add(orderItem.productId);
            });
          }
        });

        console.log("구매한 상품 ID 목록:", Array.from(purchasedPostIds));
      } catch (err) {
        console.error("주문 내역 조회 실패:", err);
        // 주문 내역 조회 실패해도 장바구니는 계속 로드
      }

      // 3. 이미 구매한 상품은 장바구니에서 제외
      const filteredItems = items.filter(item => !purchasedPostIds.has(item.postId));
      console.log("필터링 후 장바구니:", filteredItems);

      // 4. 필터링된 장바구니에서 제거된 항목이 있으면 DB에서도 삭제
      const removedItems = items.filter(item => purchasedPostIds.has(item.postId));
      if (removedItems.length > 0) {
        console.log("장바구니에서 자동 제거할 항목:", removedItems);
        for (const item of removedItems) {
          try {
            await axios.delete(
              `/api/cart/items/${item.cartId}`,
              {
                withCredentials: true,
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            console.log(`장바구니 항목 ${item.cartId} 자동 삭제 완료`);
          } catch (err) {
            console.error(`장바구니 항목 ${item.cartId} 삭제 실패:`, err);
          }
        }
      }

      // 5. 게시물 상세 정보 조회
      const enrichedItems = await Promise.all(
        filteredItems.map(async (item) => {
          try {
            const postResponse = await axios.get(
              `http://localhost:8080/api/boardlookup/${item.postId}`,
              { withCredentials: true }
            );

            const post = postResponse.data.post || postResponse.data;
            console.log("게시물 데이터:", post);

            // 이미지 URL 수정
            let imageUrl = 'https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768';
            
            if (post.pdfImages && post.pdfImages.length > 0) {
              const firstImage = post.pdfImages[0];
              if (firstImage.startsWith('http')) {
                imageUrl = firstImage;
              } else {
                imageUrl = `http://localhost:8080${firstImage}`;
              }
              console.log("PDF 이미지 사용:", imageUrl);
            }

            return {
              cartId: item.cartId,
              postId: item.postId,
              title: post.title,
              author: post.userNickname,
              price: post.price,
              imageUrl: imageUrl,
            };
          } catch (err) {
            console.error(`게시물 ${item.postId} 로드 실패:`, err);
            return null;
          }
        })
      );

      setCartItems(enrichedItems.filter(item => item !== null));
      setLoading(false);
    } catch (err) {
      console.error("장바구니 로드 실패:", err);
      setError("장바구니를 불러오는데 실패했습니다.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (cartId) => {
    if (!window.confirm("이 항목을 장바구니에서 삭제하시겠습니까?")) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      await axios.delete(
        `/api/cart/items/${cartId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      await fetchCartItems();
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("장바구니가 비어있습니다.");
      return;
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!storedUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    try {
      // cartItems를 주문 형식으로 변환
      const orderItems = cartItems.map(item => ({
        productId: item.postId,
        productName: item.title,
        unitPrice: item.price,
        qty: 1
      }));

      console.log("주문 생성 요청:", orderItems);

      // 1. 백엔드에 주문 생성 요청 (결제 전 'CREATED' 상태의 주문)
      const orderResponse = await axios.post(
        'http://localhost:8080/api/orders',
        {
          items: orderItems
        },
        {
          withCredentials: true,
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      console.log("주문 생성 완료:", orderResponse.data);

      // 2. 결제 페이지로 이동 (merchantUid와 주문 아이템 정보 전달)
      navigate('/payment', {
        state: {
          merchantUid: orderResponse.data.merchantUid,
          orderItems: cartItems  // ✅ 장바구니 아이템 정보도 함께 전달
        }
      });

    } catch (err) {
      console.error("주문 생성 실패:", err);
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <p>장바구니를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate("/login")}>로그인하러 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>장바구니</h1>
          <p className="cart-count">총 {cartItems.length}개의 상품</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>장바구니가 비어있습니다</h2>
            <p>마음에 드는 포트폴리오를 장바구니에 담아보세요!</p>
            <button className="btn-browse" onClick={() => navigate("/")}>
              둘러보기
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.cartId} className="cart-item">
                  <div className="item-image" onClick={() => navigate(`/board/lookup/read/${item.postId}`)}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      onError={(e) => {
                        console.error("이미지 로드 실패:", item.imageUrl);
                        e.target.src = 'https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768';
                      }}
                    />
                  </div>
                  <div className="item-info">
                    <h3 className="item-title" onClick={() => navigate(`/board/lookup/read/${item.postId}`)}>
                      {item.title}
                    </h3>
                    <p className="item-author">{item.author}</p>
                    <p className="item-price">{(item.price || 0).toLocaleString()}₩</p>
                  </div>
                  <button className="btn-remove" onClick={() => handleRemove(item.cartId)}>
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>상품 금액</span>
                <span>{calculateTotal().toLocaleString()}₩</span>
              </div>
              <div className="summary-row total">
                <span>총 결제 금액</span>
                <span className="total-price">{calculateTotal().toLocaleString()}₩</span>
              </div>
              <button className="btn-checkout" onClick={handleCheckout}>
                결제하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;