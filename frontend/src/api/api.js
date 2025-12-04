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

export default api;
