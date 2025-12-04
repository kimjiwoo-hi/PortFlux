package com.portflux.backend.controller;

import com.portflux.backend.model.Payment;
import com.portflux.backend.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/confirm")
    public ResponseEntity<ConfirmResponse> confirmPayment(@RequestBody ConfirmRequest req) {
        // 서버사이드에서 아임포트 검증을 수행해야 합니다. 이 코드는 구조 예시이며 실제 검증 로직을 구현하세요.
        Payment p = paymentService.confirmPayment(req.getImpUid(), req.getMerchantUid(), req.getAmount());

        ConfirmResponse res = new ConfirmResponse();
        res.setPaymentId(p.getId());
        res.setStatus(p.getStatus());
        return ResponseEntity.ok(res);
    }

    @Data
    public static class ConfirmRequest {
        private String impUid;
        private String merchantUid;
        private java.math.BigDecimal amount;
    }

    @Data
    public static class ConfirmResponse {
        private Long paymentId;
        private String status;
    }
}
