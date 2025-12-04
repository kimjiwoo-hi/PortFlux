package com.portflux.backend.service;

import com.portflux.backend.model.Order;
import com.portflux.backend.model.Payment;
import com.portflux.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    /**
     * 현재는 아임포트 서버 검증 로직은 구현하지 않고, 주문 금액과 전달된 amount를 비교하여 결제 처리를 시뮬레이션합니다.
     * 실제 구현 시 아임포트 토큰 발급, payments/{imp_uid} 조회 후 금액 비교를 반드시 수행하세요.
     */
    public Payment confirmPayment(String impUid, String merchantUid, BigDecimal amount) {
        Order order = orderService.findByMerchantUid(merchantUid);
        if (order == null) throw new IllegalArgumentException("Order not found for merchantUid=" + merchantUid);

        if (order.getTotalAmount().compareTo(amount) != 0) {
            throw new IllegalStateException("Amount mismatch");
        }

        Payment p = new Payment();
        p.setOrder(order);
        p.setImpUid(impUid);
        p.setMerchantUid(merchantUid);
        p.setAmount(amount);
        p.setStatus("PAID");
        p.setPaidAt(LocalDateTime.now());
        p.setRawResponse("{\"note\":\"stubbed verification\"}");

        return paymentRepository.save(p);
    }
}
