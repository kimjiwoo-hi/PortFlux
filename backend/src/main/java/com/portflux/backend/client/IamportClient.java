package com.portflux.backend.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

/**
 * 아임포트 REST API 클라이언트
 * - 토큰 발급 (users/getToken)
 * - 결제 정보 조회 (payments/{imp_uid})
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IamportClient {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${iamport.key:imp_test_key}")
    private String iamportKey;

    @Value("${iamport.secret:imp_test_secret}")
    private String iamportSecret;

    private static final String IAMPORT_API_BASE = "https://api.iamport.kr";
    private static final String GET_TOKEN_URL = IAMPORT_API_BASE + "/users/getToken";
    private static final String GET_PAYMENT_URL = IAMPORT_API_BASE + "/payments/{imp_uid}";

    private volatile String cachedAccessToken;
    private volatile long tokenExpiryTime;

    /**
     * 아임포트 액세스 토큰 발급
     * @return 액세스 토큰
     */
    public String getAccessToken() {
        try {
            // 토큰이 존재하고 만료되지 않았으면 재사용
            if (cachedAccessToken != null && System.currentTimeMillis() < tokenExpiryTime) {
                return cachedAccessToken;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String requestBody = String.format(
                    "{\"imp_key\":\"%s\",\"imp_secret\":\"%s\"}",
                    iamportKey, iamportSecret
            );

            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(GET_TOKEN_URL, request, String.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Failed to get iamport access token. Status: " + response.getStatusCode());
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            int code = root.get("code").asInt();

            if (code != 0) {
                String message = root.get("message").asText("Unknown error");
                throw new RuntimeException("Iamport token error: " + message);
            }

            JsonNode responseNode = root.get("response");
            cachedAccessToken = responseNode.get("access_token").asText();
            long expiresIn = responseNode.get("expires_in").asLong(3600); // 기본 1시간

            tokenExpiryTime = System.currentTimeMillis() + (expiresIn * 1000) - 60000; // 만료 1분 전 갱신

            log.info("Iamport access token obtained successfully");
            return cachedAccessToken;

        } catch (Exception e) {
            log.error("Error getting iamport access token", e);
            throw new RuntimeException("Failed to obtain iamport access token", e);
        }
    }

    /**
     * 결제 정보 조회 (아임포트 서버에서 검증)
     * @param impUid 아임포트 결제 ID
     * @return 결제 정보 (amount, status 포함)
     */
    public IamportPaymentResponse getPaymentInfo(String impUid) {
        try {
            String accessToken = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<String> request = new HttpEntity<>(headers);

            String url = GET_PAYMENT_URL.replace("{imp_uid}", impUid);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Failed to get payment info. Status: " + response.getStatusCode());
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            int code = root.get("code").asInt();

            if (code != 0) {
                String message = root.get("message").asText("Unknown error");
                throw new RuntimeException("Iamport payment error: " + message);
            }

            JsonNode paymentNode = root.get("response");

            IamportPaymentResponse paymentResponse = new IamportPaymentResponse();
            paymentResponse.setImpUid(paymentNode.get("imp_uid").asText());
            paymentResponse.setMerchantUid(paymentNode.get("merchant_uid").asText());
            paymentResponse.setAmount(new BigDecimal(paymentNode.get("amount").asText("0")));
            paymentResponse.setStatus(paymentNode.get("status").asText());
            paymentResponse.setPaidAt(paymentNode.get("paid_at").asLong(0));

            log.info("Payment info retrieved: impUid={}, amount={}, status={}", 
                    paymentResponse.getImpUid(), paymentResponse.getAmount(), paymentResponse.getStatus());

            return paymentResponse;

        } catch (Exception e) {
            log.error("Error getting payment info for impUid: {}", impUid, e);
            throw new RuntimeException("Failed to retrieve payment info from iamport", e);
        }
    }

    /**
     * 아임포트 결제 정보 DTO
     */
    public static class IamportPaymentResponse {
        private String impUid;
        private String merchantUid;
        private BigDecimal amount;
        private String status; // paid, ready, cancelled, failed, refunded 등
        private long paidAt;

        public String getImpUid() { return impUid; }
        public void setImpUid(String impUid) { this.impUid = impUid; }

        public String getMerchantUid() { return merchantUid; }
        public void setMerchantUid(String merchantUid) { this.merchantUid = merchantUid; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public long getPaidAt() { return paidAt; }
        public void setPaidAt(long paidAt) { this.paidAt = paidAt; }
    }
}