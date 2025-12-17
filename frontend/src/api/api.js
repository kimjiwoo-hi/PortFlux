import axios from "axios";

const api = axios.create({
  baseURL: "/api", // baseURL을 /api로 통일
  headers: { "Content-Type": "application/json" },
});

// --- Cart APIs ---
export async function getCart(userId) {
  // TODO: userId는 추후 인증 로직을 통해 자동으로 처리되도록 변경해야 합니다.
  return api.get(`/cart/${userId}`);
}

export async function addToCart(userId, item) {
  // item 구조: { postId, qty, productName, unitPrice }
  return api.post(`/cart/${userId}/items`, item);
}

export async function updateCartQuantity(cartId, qty) {
  return api.patch(`/cart/items/${cartId}`, { qty });
}

export async function removeFromCart(cartId) {
  return api.delete(`/cart/items/${cartId}`);
}

// --- Order & Payment APIs ---
export async function createOrder(payload) {
  return api.post("/orders", payload);
}

export async function confirmPayment(payload) {
  return api.post("/payments/confirm", payload);
}

export async function getPaymentResult(merchantUid) {
    return api.get(`/payments/result?merchantUid=${encodeURIComponent(merchantUid)}`);
}

// --- Follow APIs ---
export async function getFollowing(userId) {
  return api.get(`/${userId}/following`);
}

export async function getFollowers(userId) {
  return api.get(`/${userId}/followers`);
}

export async function follow(followerId, followingId) {
  return api.post("/follow", { followerId, followingId });
}

export async function unfollow(followerId, followingId) {
  return api.delete("/unfollow", { data: { followerId, followingId } });
}

export default api;