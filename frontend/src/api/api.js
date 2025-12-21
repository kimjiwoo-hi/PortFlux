import axios from "axios";

const api = axios.create({
  baseURL: "/", // baseURL을 루트로 변경
  headers: { "Content-Type": "application/json" },
});

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
  return api.get(`/api/${userId}/following`);
}

export async function getFollowers(userId) {
  return api.get(`/api/${userId}/followers`);
}

export async function follow(followerId, followingId) {
  return api.post("/api/follow", { followerId, followingId });
}

export async function unfollow(followerId, followingId) {
  return api.delete("/api/unfollow", { data: { followerId, followingId } });
}

export default api;