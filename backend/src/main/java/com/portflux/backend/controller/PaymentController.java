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
            if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(
                        new ErrorResponse("INVALID_AMOUNT", "amount must be greater than 0")
                );
            }

            // 결제 확인 (아임포트 서버 검증 포함)
            PaymentRecord payment = paymentService.confirmPayment(req.getImpUid(), req.getMerchantUid(), req.getAmount());

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
    public static class ConfirmRequest {
        private String impUid;
        private String merchantUid;
        private BigDecimal amount;
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
    public static class ErrorResponse {
        private String code;
        private String message;

        public ErrorResponse(String code, String message) {
            this.code = code;
            this.message = message;
        }
    }
}