package com.portflux.backend.controller;

import com.portflux.backend.model.Payment;
import com.portflux.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 아임포트 웹훅 처리 컨트롤러
 * 아임포트 서버에서 결제 상태 변경 시 이 엔드포인트를 호출
 * 
 * 기능:
 * - Idempotency 처리: imp_uid로 중복 수신 방지
 * - 결제 상태 동기화
 */
@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {
    private final PaymentRepository paymentRepository;

    /**
     * 아임포트 웹훅 엔드포인트
     * 결제 상태 변경 알림 수신 및 처리
     * 
     * Idempotency (중복 방지):
     * - 같은 imp_uid로 여러 번 요청 받아도 1번만 처리
     * - imp_uid가 이미 DB에 있으면 무시하고 OK 응답
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            log.info("Webhook received: {}", payload);

            String impUid = (String) payload.get("imp_uid");
            String merchantUid = (String) payload.get("merchant_uid");
            String status = (String) payload.get("status");

            // 입력값 검증
            if (impUid == null || impUid.isEmpty()) {
                log.warn("Invalid webhook payload: impUid missing");
                return ResponseEntity.badRequest().body(
                        Map.of("code", "INVALID_PAYLOAD", "message", "impUid is required")
                );
            }

            // ========================================
            // Idempotency 처리: 중복 수신 방지
            // ========================================
            Optional<Payment> existingPayment = paymentRepository.findByImpUid(impUid);
            if (existingPayment.isPresent()) {
                // 이미 처리된 imp_uid → 중복 수신
                log.warn("Duplicate webhook received: impUid={}, merchantUid={} (already processed)", 
                        impUid, merchantUid);
                
                // 중복이어도 OK 응답 (아임포트가 재시도하지 않도록)
                Map<String, Object> response = new HashMap<>();
                response.put("code", 0);
                response.put("message", "Webhook already processed (idempotency)");
                return ResponseEntity.ok(response);
            }

            // ========================================
            // 신규 웹훅 처리
            // ========================================
            log.info("Processing new webhook: impUid={}, merchantUid={}, status={}", 
                    impUid, merchantUid, status);

            // 웹훅 처리 로직
            // 현재는 단순히 로깅만 수행
            // 필요시 아래 로직 추가:
            // 1. 주문 조회 (merchantUid)
            // 2. 결제 상태 업데이트 (status 에 따라)
            // 3. 환불 처리 등

            if (status != null && "cancelled".equals(status.toLowerCase())) {
                log.info("Payment cancelled webhook: impUid={}", impUid);
                // 환불 처리 로직 추가 가능
            } else if (status != null && "paid".equals(status.toLowerCase())) {
                log.info("Payment confirmed webhook: impUid={}", impUid);
                // 이미 /confirm 에서 처리했으므로 여기서는 재확인만
            }

            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("message", "Webhook processed successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error processing webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("code", "ERROR", "message", "Failed to process webhook: " + e.getMessage())
            );
        }
    }
}