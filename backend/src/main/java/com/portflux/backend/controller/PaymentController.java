package com.portflux.backend.controller;

import com.portflux.backend.model.PaymentRecord;
import com.portflux.backend.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final com.portflux.backend.service.OrderService orderService;

    /**
     * 주문 결과 조회
     */
    @GetMapping("/result")
    public ResponseEntity<?> getOrderResult(@RequestParam String merchantUid) {
        try {
            com.portflux.backend.model.Order order = orderService.findByMerchantUid(merchantUid);

            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse("ORDER_NOT_FOUND", "주문을 찾을 수 없습니다.")
                );
            }

            ResultResponse res = new ResultResponse();
            res.setStatus(order.getStatus());
            res.setOrderId(order.getId());
            res.setPaymentId(null); // 실제 결제 ID는 PaymentRecord에서 가져와야 함
            res.setAmount(order.getTotalAmount());
            res.setMessage("주문이 생성되었습니다.");

            return ResponseEntity.ok(res);

        } catch (Exception e) {
            log.error("Error fetching order result", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("INTERNAL_ERROR", "주문 조회 중 오류가 발생했습니다.")
            );
        }
    }

    /**
     * 포트원 웹훅 수신 엔드포인트
     * 포트원 서버가 결제 완료 시 이 엔드포인트로 POST 요청을 보냄
     * 클라이언트 콜백과 별개로 서버 간 통신으로 결제 결과를 100% 보장
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody WebhookRequest webhookReq) {
        try {
            log.info("Webhook received: imp_uid={}, merchant_uid={}, status={}",
                    webhookReq.getImp_uid(), webhookReq.getMerchant_uid(), webhookReq.getStatus());

            // 입력값 검증
            if (webhookReq.getImp_uid() == null || webhookReq.getImp_uid().isEmpty()) {
                log.warn("Webhook validation failed: imp_uid is missing");
                return ResponseEntity.badRequest().body(
                        new ErrorResponse("INVALID_WEBHOOK", "imp_uid is required")
                );
            }

            if (webhookReq.getMerchant_uid() == null || webhookReq.getMerchant_uid().isEmpty()) {
                log.warn("Webhook validation failed: merchant_uid is missing");
                return ResponseEntity.badRequest().body(
                        new ErrorResponse("INVALID_WEBHOOK", "merchant_uid is required")
                );
            }

            // 결제 상태가 'paid'인 경우에만 처리 (결제 완료)
            if ("paid".equals(webhookReq.getStatus())) {
                try {
                    // 중복 처리 방지: 이미 처리된 결제인지 확인
                    PaymentRecord existingPayment = paymentService.findByImpUid(webhookReq.getImp_uid());

                    if (existingPayment != null) {
                        log.info("Payment already processed: imp_uid={}", webhookReq.getImp_uid());
                        return ResponseEntity.ok(new WebhookResponse("success", "Already processed"));
                    }

                    // 결제 검증 및 저장
                    PaymentRecord payment = paymentService.confirmPayment(
                            webhookReq.getImp_uid(),
                            webhookReq.getMerchant_uid()
                    );

                    log.info("Webhook payment processed successfully: paymentId={}, status={}",
                            payment.getId(), payment.getStatus());

                    return ResponseEntity.ok(new WebhookResponse("success", "Payment processed"));

                } catch (IllegalStateException e) {
                    // 이미 처리된 결제이거나 상태가 맞지 않는 경우
                    log.warn("Payment state error in webhook: {}", e.getMessage());
                    return ResponseEntity.ok(new WebhookResponse("success", "Already handled"));
                } catch (Exception e) {
                    log.error("Error processing webhook payment", e);
                    // 웹훅은 실패해도 200 응답을 보내야 포트원이 재시도하지 않음
                    return ResponseEntity.ok(new WebhookResponse("error", e.getMessage()));
                }
            } else {
                // 결제 실패, 취소 등의 상태
                log.info("Webhook received with non-paid status: status={}", webhookReq.getStatus());
                return ResponseEntity.ok(new WebhookResponse("success", "Non-paid status received"));
            }

        } catch (Exception e) {
            log.error("Unexpected error in webhook handler", e);
            // 웹훅은 항상 200 응답
            return ResponseEntity.ok(new WebhookResponse("error", "Internal error"));
        }
    }

    /**
     * 결제 검증 및 확인
     * 프론트에서 아임포트 결제 후 imp_uid를 받아 서버에서 검증
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody ConfirmRequest req) {
        try {
            log.info("Payment confirmation request: merchantUid={}, impUid={}", req.getMerchantUid(), req.getImpUid());

            // 입력값 검증
            if (req.getImpUid() == null || req.getImpUid().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new ErrorResponse("INVALID_IMP_UID", "impUid is required")
                );
            }
            if (req.getMerchantUid() == null || req.getMerchantUid().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new ErrorResponse("INVALID_MERCHANT_UID", "merchantUid is required")
                );
            }

            // 결제 확인 (아임포트 서버 검증 포함)
            PaymentRecord payment = paymentService.confirmPayment(req.getImpUid(), req.getMerchantUid());

            ConfirmResponse res = new ConfirmResponse();
            res.setPaymentId(payment.getId());
            res.setStatus(payment.getStatus());
            res.setImpUid(payment.getImpUid());
            res.setAmount(payment.getAmount());
            res.setPaidAt(payment.getPaidAt());

            log.info("Payment confirmed successfully: paymentId={}, status={}", payment.getId(), payment.getStatus());
            return ResponseEntity.ok(res);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid argument in payment confirmation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse("NOT_FOUND", e.getMessage())
            );
        } catch (IllegalStateException e) {
            log.warn("Invalid state in payment confirmation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    new ErrorResponse("CONFLICT", e.getMessage())
            );
        } catch (Exception e) {
            log.error("Unexpected error in payment confirmation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("INTERNAL_ERROR", "Payment confirmation failed: " + e.getMessage())
            );
        }
    }

    @Data
    public static class WebhookRequest {
        private String imp_uid;        // 포트원 결제 고유번호
        private String merchant_uid;   // 가맹점 주문번호
        private String status;         // 결제 상태 (paid, failed, cancelled 등)
    }

    @Data
    public static class WebhookResponse {
        private String status;
        private String message;

        public WebhookResponse(String status, String message) {
            this.status = status;
            this.message = message;
        }
    }

    @Data
    public static class ConfirmRequest {
        private String impUid;
        private String merchantUid;
    }

    @Data
    public static class ConfirmResponse {
        private Long paymentId;
        private String status;
        private String impUid;
        private BigDecimal amount;
        private Object paidAt;
    }

    @Data
    public static class ResultResponse {
        private String status;
        private Long orderId;
        private Long paymentId;
        private BigDecimal amount;
        private String message;
    }

    @Data
    public static class ErrorResponse {
        private String code;
        private String message;

        public ErrorResponse(String code, String message) {
            this.code = code;
            this.message = message;
        }
    }
}