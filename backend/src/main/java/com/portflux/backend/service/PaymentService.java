package com.portflux.backend.service;

import com.portflux.backend.model.Order;
import com.portflux.backend.model.Payment;
import com.portflux.backend.repository.OrderRepository;
import com.portflux.backend.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

// ===== DTO 정의 (실제로는 별도의 파일에 있어야 합니다) =====
class TokenRequest {
    /* ... */ }

class TokenResponse {
    /* ... */ }

class PaymentInfoResponse {
    /* ... */ }
// =========================================================

@Slf4j
@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Value("${portone.api.key}")
    private String apiKey;

    @Value("${portone.api.secret}")
    private String apiSecret;

    private final WebClient webClient;

    public PaymentService(WebClient.Builder webClientBuilder, OrderRepository orderRepository,
            PaymentRepository paymentRepository) {
        this.webClient = webClientBuilder.baseUrl("https://api.iamport.kr").build();
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    // ... (confirmPayment 메서드 생략 - 변경 없음) ...
    @Transactional
    public Payment confirmPayment(String impUid, String merchantUid, BigDecimal amount) {
        // ... (결제 위변조 검증 및 DB 저장 로직 생략) ...
        return null; // 실제 구현은 결제 객체를 반환해야 함
    }

    /**
     * 주문 상태와 결제 기록을 기반으로 최종 결과를 DTO로 반환 (GET /api/payments/result 처리)
     */
    public com.portflux.backend.controller.PaymentController.PaymentResultResponse getPaymentResult(
            String merchantUid) {
        Order order = orderRepository.findByMerchantUid(merchantUid)
                .orElseThrow(() -> new IllegalArgumentException("요청된 주문 정보를 찾을 수 없습니다."));

        Optional<Payment> paymentOpt = paymentRepository.findByMerchantUid(merchantUid);

        com.portflux.backend.controller.PaymentController.PaymentResultResponse response = new com.portflux.backend.controller.PaymentController.PaymentResultResponse();

        response.setOrderId(order.getId());
        response.setMerchantUid(order.getMerchantUid());
        response.setAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());

        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            response.setStatus(payment.getStatus());
            response.setPaymentId(payment.getId());
            response.setMessage("결제 처리가 완료되었습니다.");

        } else if ("CREATED".equals(order.getStatus())) {
            // 주문은 생성되었으나 결제 기록이 없으면 PENDING으로 응답 (클라이언트가 재시도 유도)
            response.setStatus("PENDING");
            response.setMessage("결제 확인이 필요합니다.");
        }

        return response;
    }

    // ... (내부 PortOne API 통신 메서드 생략 - 변경 없음) ...
}