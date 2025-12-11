import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export async function getCart() {
  return api.get("/cart");
}

export async function createOrder(payload) {
  return api.post("/orders", payload);
}

export async function confirmPayment(payload) {
  return api.post("/payments/confirm", payload);
}

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
