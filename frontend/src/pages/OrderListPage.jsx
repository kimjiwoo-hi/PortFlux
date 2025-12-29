import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrderListPage.css";

export default function OrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all"); // all, 1month, 3months, 6months, 1year

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!storedUser) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);

    try {
      setLoading(true);
      const response = await axios.get(
        `/api/orders/user`,
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("주문 내역:", response.data);
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error("주문 내역 조회 실패:", err);
      setError("주문 내역을 불러오는데 실패했습니다.");
      setLoading(false);
    }
  };

  const filterOrdersByPeriod = (orders) => {
    if (filterPeriod === "all") return orders;

    const now = new Date();
    const filterDate = new Date();

    switch (filterPeriod) {
      case "1month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return orders;
    }

    return orders.filter(order => new Date(order.createdAt) >= filterDate);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'CREATED': '주문 생성',
      'PENDING': '결제 대기',
      'PAID': '결제 완료',
      'CANCELLED': '주문 취소'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'CREATED': 'status-created',
      'PENDING': 'status-pending',
      'PAID': 'status-paid',
      'CANCELLED': 'status-cancelled'
    };
    return classMap[status] || '';
  };

  if (loading) {
    return (
      <div className="order-list-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>주문 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-list-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate("/login")}>로그인하러 가기</button>
        </div>
      </div>
    );
  }

  const filteredOrders = filterOrdersByPeriod(orders);

  return (
    <div className="order-list-page">
      <div className="order-list-container">
        <div className="page-header">
          <h1>주문 내역</h1>
          <p className="total-count">총 {filteredOrders.length}건의 주문</p>
        </div>

        <div className="filter-section">
          <button
            className={`filter-btn ${filterPeriod === "all" ? "active" : ""}`}
            onClick={() => setFilterPeriod("all")}
          >
            전체
          </button>
          <button
            className={`filter-btn ${filterPeriod === "1month" ? "active" : ""}`}
            onClick={() => setFilterPeriod("1month")}
          >
            1개월
          </button>
          <button
            className={`filter-btn ${filterPeriod === "3months" ? "active" : ""}`}
            onClick={() => setFilterPeriod("3months")}
          >
            3개월
          </button>
          <button
            className={`filter-btn ${filterPeriod === "6months" ? "active" : ""}`}
            onClick={() => setFilterPeriod("6months")}
          >
            6개월
          </button>
          <button
            className={`filter-btn ${filterPeriod === "1year" ? "active" : ""}`}
            onClick={() => setFilterPeriod("1year")}
          >
            1년
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>주문 내역이 없습니다</h2>
            <p>첫 주문을 시작해보세요!</p>
            <button className="btn-browse" onClick={() => navigate("/")}>
              둘러보기
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="order-number">주문번호: {order.id}</span>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="order-items">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <h3>{item.productName}</h3>
                        <p className="item-details">
                          {item.unitPrice.toLocaleString()}₩ × {item.qty}개
                        </p>
                      </div>
                      <div className="item-price">
                        {(item.unitPrice * item.qty).toLocaleString()}₩
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="total-amount">
                    <span>총 결제 금액</span>
                    <span className="amount">{order.totalAmount.toLocaleString()}₩</span>
                  </div>
                  <div className="order-actions">
                    <button
                      className="btn-detail"
                      onClick={() => navigate(`/order-result?merchant_uid=${order.merchantUid}`)}
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
