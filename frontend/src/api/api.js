import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// --- Cart APIs ---
export async function getCart(userId) {
  // TODO: userId는 추후 인증 로직을 통해 자동으로 처리되도록 변경해야 합니다.
  return api.get(`/cart/${userId}`);
}

export async function addToCart(userId, item) {
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

<<<<<<< HEAD
// Follow APIs
=======
>>>>>>> KSH-chatting
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

<<<<<<< HEAD
// Chat APIs
export async function getChatRooms(userId) {
  return api.get(`/chats?userId=${userId}`);
}

export async function getChatMessages(roomId) {
  return api.get(`/chats/${roomId}/messages`);
}

export async function getOrCreateChatRoom(payload) {
  return api.post("/chats", payload);
}

=======
>>>>>>> KSH-chatting
export default api;
