package com.portflux.backend.service;

import com.portflux.backend.model.Order;
import com.portflux.backend.model.PaymentRecord;
import com.portflux.backend.repository.PaymentRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final IamportClient iamportClient; // 공식 IamportClient

    @Transactional
    public PaymentRecord confirmPayment(String impUid, String merchantUid) throws IamportResponseException, IOException {
        log.info("Starting payment confirmation: impUid={}, merchantUid={}",
                impUid, merchantUid);

        // 1. 주문 조회
        Order order = orderService.findByMerchantUid(merchantUid);
        if (order == null) {
            log.error("Order not found: merchantUid={}", merchantUid);
            throw new IllegalArgumentException("Order not found for merchantUid=" + merchantUid);
        }

        // 2. 중복 결제 확인
        paymentRepository.findByMerchantUid(merchantUid).ifPresent(p -> {
            if ("PAID".equals(p.getStatus())) {
                log.warn("Payment already processed: merchantUid={}", merchantUid);
                throw new IllegalStateException("Payment already processed for this order");
            }
        });

        // 3. 아임포트 서버에서 결제 정보 조회
        IamportResponse<Payment> iamportResponse = iamportClient.paymentByImpUid(impUid);
        Payment iamportPayment = iamportResponse.getResponse();

        // 4. 결제 상태 확인 ("paid")
        if (!"paid".equals(iamportPayment.getStatus())) {
            log.error("Invalid payment status from iamport: status={}, impUid={}",
                    iamportPayment.getStatus(), impUid);
            throw new IllegalStateException("Payment status is not 'paid': " + iamportPayment.getStatus());
        }

        // 5. 금액 비교 (DB 주문금액 vs 아임포트 결제금액)
        if (order.getTotalAmount().compareTo(iamportPayment.getAmount()) != 0) {
            log.error("Amount mismatch: orderAmount={}, iamportAmount={}, impUid={}",
                    order.getTotalAmount(), iamportPayment.getAmount(), impUid);
            // TODO: 금액 불일치 시 결제 취소 로직 추가
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

        // 7. PaymentRecord 레코드 생성 및 저장
        PaymentRecord paymentRecord = new PaymentRecord();
        paymentRecord.setOrder(order);
        paymentRecord.setImpUid(impUid);
        paymentRecord.setMerchantUid(merchantUid);
        paymentRecord.setAmount(iamportPayment.getAmount());
        paymentRecord.setStatus("PAID");
        if (iamportPayment.getPaidAt() != null) {
            paymentRecord.setPaidAt(LocalDateTime.ofInstant(iamportPayment.getPaidAt().toInstant(), ZoneId.systemDefault()));
        } else {
            paymentRecord.setPaidAt(LocalDateTime.now());
        }
        paymentRecord.setRawResponse(iamportPayment.toString()); // JSON 변환이 더 좋을 수 있음

        PaymentRecord savedPayment = paymentRepository.save(paymentRecord);

        // 8. 주문 상태 변경
        order.setStatus("PAID");
        // orderService.updateOrderStatus(order); // Order 엔티티가 변경 감지에 의해 자동 업데이트 되도록 설정

        log.info("Payment confirmed successfully: paymentId={}, merchantUid={}",
                savedPayment.getId(), merchantUid);

        return savedPayment;
    }
}