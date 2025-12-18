package com.portflux.backend.controller;

import com.portflux.backend.model.Payment;
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
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PaymentController {
    private final PaymentService paymentService;

    // ... (confirmPayment 메서드 생략 - 변경 없음) ...
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody ConfirmRequest req) {
        try {
            // ... (결제 검증 로직 호출 생략) ...
            Payment payment = paymentService.confirmPayment(req.getImpUid(), req.getMerchantUid(), req.getAmount());

            ConfirmResponse res = new ConfirmResponse();
            res.setPaymentId(payment.getId());
            res.setStatus(payment.getStatus());
            // ... (기타 응답 필드 설정 생략) ...

            return ResponseEntity.ok(res);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 주문/결제 결과 조회 (프론트엔드 OrderResultPage에서 호출)
     */
    @GetMapping("/result")
    public ResponseEntity<?> getPaymentResult(@RequestParam String merchantUid) {
        try {
            // Service 계층의 getPaymentResult 호출 (추가된 핵심 로직)
            PaymentResultResponse result = paymentService.getPaymentResult(merchantUid);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse("ORDER_NOT_FOUND", e.getMessage()));
        } catch (Exception e) {
            log.error("Error retrieving payment result", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ErrorResponse("INTERNAL_ERROR", "결과 조회 실패: " + e.getMessage()));
        }
    }

    // ===================================
    // DTOs (PaymentResultResponse 추가)
    // ===================================
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
    public static class PaymentResultResponse {
        private Long orderId;
        private String merchantUid;
        private String status; // PAID, PENDING, FAILED, CANCELLED
        private BigDecimal amount;
        private Long paymentId;
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