import axios from "axios";

const api = axios.create({
  baseURL: "/", // baseURL을 루트로 변경
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // 모든 요청에 쿠키 포함
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


// --- Cart APIs (Updated) ---
/**
 * 현재 사용자의 장바구니 목록을 가져옵니다.
 * @returns {Promise<import("../dto/CartItemDto").CartItemDto[]>} 장바구니 항목 리스트
 */
export async function getCartItems() {
  return api.get("/api/cart");
}

/**
 * 장바구니에 상품(게시물)을 추가합니다.
 * @param {number} postId - 장바구니에 추가할 게시물의 ID
 */
export async function addItemToCart(postId) {
  return api.post("/api/cart", { postId });
}

/**
 * 장바구니에서 특정 항목을 삭제합니다.
 * @param {number} cartId - 삭제할 장바구니 항목의 ID
 */
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
/**
 * 특정 사용자의 팔로잉 목록 조회
 * @param {number} userNum - 조회할 사용자 번호
 * @returns {Promise<{count: number, list: Array}>}
 */
export async function getFollowing(userNum) {
  return api.get(`/api/follow/following/${userNum}`);
}

/**
 * 특정 사용자의 팔로워 목록 조회
 * @param {number} userNum - 조회할 사용자 번호
 * @returns {Promise<{count: number, list: Array}>}
 */
export async function getFollowers(userNum) {
  return api.get(`/api/follow/followers/${userNum}`);
}

/**
 * 팔로우하기
 * @param {number} targetUserNum - 팔로우할 대상 사용자 번호
 * @returns {Promise}
 */
export async function follow(targetUserNum) {
  // X-USER-NUM 헤더는 인터셉터에서 자동으로 추가됨
  const userNumStr = localStorage.getItem("userNum") || sessionStorage.getItem("userNum");
  return api.post(`/api/follow/${targetUserNum}`, {}, {
    headers: {
      'X-USER-NUM': userNumStr
    }
  });
}

/**
 * 언팔로우하기
 * @param {number} targetUserNum - 언팔로우할 대상 사용자 번호
 * @returns {Promise}
 */
export async function unfollow(targetUserNum) {
  const userNumStr = localStorage.getItem("userNum") || sessionStorage.getItem("userNum");
  return api.delete(`/api/follow/${targetUserNum}`, {
    headers: {
      'X-USER-NUM': userNumStr
    }
  });
}

/**
 * 팔로우 여부 확인
 * @param {number} targetUserNum - 확인할 대상 사용자 번호
 * @returns {Promise<{following: boolean}>}
 */
export async function isFollowing(targetUserNum) {
  const userNumStr = localStorage.getItem("userNum") || sessionStorage.getItem("userNum");
  return api.get(`/api/follow/is-following/${targetUserNum}`, {
    headers: {
      'X-USER-NUM': userNumStr
    }
  });
}

export default api;