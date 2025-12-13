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

/**
 * [추가] GET /api/payments/result 호출
 */
export async function getPaymentResult(merchantUid) {
    return api.get(`/payments/result?merchantUid=${encodeURIComponent(merchantUid)}`);
}

export default api;