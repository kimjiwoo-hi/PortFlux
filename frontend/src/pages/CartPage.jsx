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

      // 장바구니 목록 가져오기
      console.log("=== 장바구니 조회 ===");
      console.log("User Num:", user.userNum);
      console.log("Token 존재:", !!token);

      const cartResponse = await axios.get(
        `/api/cart/${user.userNum}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("장바구니 응답:", cartResponse.data);

      // postId로 게시물 정보 가져오기
      const items = cartResponse.data.items || [];
      console.log("장바구니 항목 수:", items.length);
      console.log("항목 목록:", items);
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const postResponse = await axios.get(
              `/api/boardlookup/${item.postId}`,
              { withCredentials: true }
            );

            const post = postResponse.data.post || postResponse.data;

            // 썸네일 이미지 URL 생성
            let imageUrl = 'https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768';

            if (post.pdfImages && post.pdfImages.length > 0) {
              imageUrl = `${post.pdfImages[0]}`;
            } else if (post.postFile) {
              imageUrl = `/uploads/${post.postFile}`;
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

      // 삭제 후 목록 다시 불러오기
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
      // 장바구니 아이템을 Order API 형식으로 변환
      const orderItems = cartItems.map(item => ({
        productId: item.postId,
        productName: item.title,
        unitPrice: item.price || 0,
        qty: 1
      }));

      // 주문 생성 API 호출
      const orderResponse = await axios.post(
        '/api/orders',
        {
          userId: user.userNum,
          items: orderItems
        },
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("주문 생성 완료:", orderResponse.data);

      // 주문 완료 후 장바구니 비우기
      for (const item of cartItems) {
        await axios.delete(
          `/api/cart/items/${item.cartId}`,
          {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      }

      // OrderResultPage로 이동 (merchant_uid 전달)
      navigate(`/order-result?merchant_uid=${orderResponse.data.merchantUid}`);

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
                  <div className="item-image" onClick={() => navigate(`/board/lookup/${item.postId}`)}>
                    <img src={item.imageUrl} alt={item.title} />
                  </div>
                  <div className="item-info">
                    <h3 className="item-title" onClick={() => navigate(`/board/lookup/${item.postId}`)}>
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
