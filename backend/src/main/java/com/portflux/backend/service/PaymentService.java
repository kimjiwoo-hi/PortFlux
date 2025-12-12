package com.portflux.backend.service;

import com.portflux.backend.client.IamportClient;
import com.portflux.backend.model.Order;
import com.portflux.backend.model.Payment;
import com.portflux.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final IamportClient iamportClient;

    /**
     * 결제 확인 및 검증 (아임포트 서버 검증 포함)
     * 1. 주문 정보 조회
     * 2. 아임포트에서 결제 정보 조회 및 금액 검증
     * 3. Payment 레코드 저장
     * 4. Order 상태를 PAID로 변경
     *
     * @param impUid     아임포트 결제 ID
     * @param merchantUid 주문 고유 ID
     * @param amount     프론트에서 전달한 금액 (이중 검증용)
     * @return Payment 저장 결과
     * @throws IllegalArgumentException 주문을 찾을 수 없음
     * @throws IllegalStateException    금액 불일치 또는 검증 실패
     */
    @Transactional
    public Payment confirmPayment(String impUid, String merchantUid, BigDecimal amount) {
        log.info("Starting payment confirmation: impUid={}, merchantUid={}, amount={}", 
                impUid, merchantUid, amount);

        // 1. 주문 조회
        Order order = orderService.findByMerchantUid(merchantUid);
        if (order == null) {
            log.error("Order not found: merchantUid={}", merchantUid);
            throw new IllegalArgumentException("Order not found for merchantUid=" + merchantUid);
        }

        // 2. 중복 결제 확인 (이미 결제된 주문인지)
        Payment existingPayment = paymentRepository.findByMerchantUid(merchantUid).orElse(null);
        if (existingPayment != null && "PAID".equals(existingPayment.getStatus())) {
            log.warn("Payment already processed: merchantUid={}", merchantUid);
            throw new IllegalStateException("Payment already processed for this order");
        }

        // 3. 아임포트 서버에서 결제 정보 조회
        IamportClient.IamportPaymentResponse iamportPayment;
        try {
            iamportPayment = iamportClient.getPaymentInfo(impUid);
        } catch (Exception e) {
            log.error("Failed to fetch payment info from iamport: impUid={}", impUid, e);
            throw new IllegalStateException("Failed to verify payment with iamport: " + e.getMessage(), e);
        }

        // 4. 결제 상태 확인 (paid 상태여야 함)
        if (!"paid".equals(iamportPayment.getStatus())) {
            log.error("Invalid payment status from iamport: status={}, impUid={}", 
                    iamportPayment.getStatus(), impUid);
            throw new IllegalStateException("Payment status is not 'paid': " + iamportPayment.getStatus());
        }

        // 5. 금액 비교 (DB 주문금액 vs 아임포트 결제금액)
        if (order.getTotalAmount().compareTo(iamportPayment.getAmount()) != 0) {
            log.error("Amount mismatch: orderAmount={}, iamportAmount={}, impUid={}", 
                    order.getTotalAmount(), iamportPayment.getAmount(), impUid);
            throw new IllegalStateException(
                    String.format("Amount mismatch: expected %s, got %s", 
                    order.getTotalAmount(), iamportPayment.getAmount())
            );
        }

        // 6. 주문 merchantUid 대조
        if (!merchantUid.equals(iamportPayment.getMerchantUid())) {
            log.error("MerchantUid mismatch: orderMerchantUid={}, iamportMerchantUid={}", 
                    merchantUid, iamportPayment.getMerchantUid());
            throw new IllegalStateException("MerchantUid mismatch");
        }

        // 7. Payment 레코드 생성 및 저장
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setImpUid(impUid);
        payment.setMerchantUid(merchantUid);
        payment.setAmount(iamportPayment.getAmount());
        payment.setStatus("PAID");
        payment.setPaidAt(LocalDateTime.now());
        payment.setRawResponse(iamportPayment.toString());

        Payment savedPayment = paymentRepository.save(payment);

        // 8. 주문 상태 변경
        order.setStatus("PAID");
        orderService.updateOrderStatus(order);

        log.info("Payment confirmed successfully: paymentId={}, merchantUid={}", 
                savedPayment.getId(), merchantUid);

        return savedPayment;
    }
}