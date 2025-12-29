import axios from "axios";

const api = axios.create({
  baseURL: "/", // baseURL을 루트로 변경
  headers: { "Content-Type": "application/json" },
});

// Axios 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지 또는 세션 스토리지에서 사용자 정보 가져오기
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    
    if (userStr) {
      const user = JSON.parse(userStr);
      // 사용자 정보에 토큰이 있는지 확인 (백엔드 응답에 'token' 필드가 있다고 가정)
      const token = user.token; 

      if (token) {
        // 토큰이 있으면 Authorization 헤더에 Bearer 토큰으로 추가
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);


// --- Cart APIs ---
export async function getCart(userId) {
  // TODO: userId는 추후 인증 로직을 통해 자동으로 처리되도록 변경해야 합니다.
  return api.get(`/api/cart/${userId}`);
}

export async function addToCart(userId, item) {
  return api.post(`/api/cart/${userId}/items`, item);
}

export async function updateCartQuantity(cartId, qty) {
  return api.patch(`/api/cart/items/${cartId}`, { qty });
}

export async function removeFromCart(cartId) {
  return api.delete(`/api/cart/items/${cartId}`);
}


// --- Order & Payment APIs ---
export async function createOrder(payload) {
  return api.post("/api/orders", payload);
}

export async function confirmPayment(payload) {
  return api.post("/api/payments/confirm", payload);
}

// --- Follow APIs ---
export async function getFollowing(userId) {
  return api.get(`/api/follow/following/${userId}`);
}

export async function getFollowers(userId) {
  return api.get(`/api/follow/followers/${userId}`);
}

export async function follow(followerId, followingId) {
  return api.post(`/api/follow/${followingId}`);
}

export async function unfollow(followerId, followingId) {
  return api.delete(`/api/follow/${followingId}`);
}

export default api;