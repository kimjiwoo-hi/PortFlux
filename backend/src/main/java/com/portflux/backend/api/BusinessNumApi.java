package com.portflux.backend.api;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class BusinessNumApi {

    // 공공데이터포털 인증키 (Decoded 상태 - 인코딩 없이 사용)
    private final String SERVICE_KEY = "a217371dbc2951d98713243018c5f9d825f1a75c803217472581e7b42dc29a05";

    // 국세청 사업자등록정보 상태조회 API URL
    private final String API_URL = "https://api.odcloud.kr/api/nts-businessman/v1/status";

    // 타임아웃 설정된 RestTemplate
    private final RestTemplate restTemplate;

    // 캐시 (5분간 유효)
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final long CACHE_DURATION_MS = 5 * 60 * 1000; // 5분

    private static class CacheEntry {
        boolean isValid;
        long timestamp;

        CacheEntry(boolean isValid) {
            this.isValid = isValid;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_DURATION_MS;
        }
    }

    public BusinessNumApi() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10초
        factory.setReadTimeout(30000);    // 30초
        this.restTemplate = new RestTemplate(factory);
    }

    public boolean checkBusinessNumber(String businessNumber) {
        if (businessNumber == null) return false;
        String cleanNum = businessNumber.replace("-", ""); // 하이픈 제거

        // 캐시 확인
        CacheEntry cached = cache.get(cleanNum);
        if (cached != null && !cached.isExpired()) {
            System.out.println("▶ [캐시 히트] 사업자번호: " + cleanNum + ", 결과: " + cached.isValid);
            return cached.isValid;
        }

        // 최대 3회 재시도
        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                System.out.println("▶ [API 호출 시도 " + attempt + "/" + maxRetries + "] 사업자번호: " + cleanNum);

                // UriComponentsBuilder로 URL 생성 (자동 인코딩 비활성화)
                String url = UriComponentsBuilder.fromHttpUrl(API_URL)
                        .queryParam("serviceKey", SERVICE_KEY)  // Decoded Key 사용
                        .queryParam("returnType", "JSON")
                        .build(false)  // 인코딩 하지 않음
                        .toUriString();

                System.out.println("▶ [요청 URL]: " + url);

                // 요청 헤더 설정
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                // 요청 바디 생성
                Map<String, List<String>> requestBody = new HashMap<>();
                requestBody.put("b_no", Collections.singletonList(cleanNum));

                System.out.println("▶ [요청 바디]: " + requestBody);

                HttpEntity<Map<String, List<String>>> entity = new HttpEntity<>(requestBody, headers);

                // API 호출
                ResponseEntity<Map> response = restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        Map.class
                );

                System.out.println("▶ [응답 코드]: " + response.getStatusCode());

                // 응답 처리
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> body = (Map<String, Object>) response.getBody();

                    System.out.println("▶ [응답 바디]: " + body);

                    // API 서버 오류 체크
                    if (body.containsKey("code")) {
                        Integer code = (Integer) body.get("code");
                        if (code != null && code < 0) {
                            System.err.println("❌ [API 오류] code: " + code + ", msg: " + body.get("msg"));
                            if (attempt < maxRetries) {
                                long waitTime = attempt * 3000L;
                                System.out.println("⏳ " + (waitTime / 1000) + "초 후 재시도...");
                                Thread.sleep(waitTime);
                                continue;
                            }
                            return false;
                        }
                    }

                    if (body.containsKey("data")) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");

                        if (dataList != null && !dataList.isEmpty()) {
                            Map<String, Object> data = dataList.get(0);
                            String taxType = (String) data.get("tax_type");

                            System.out.println("▶ [국세청 API 판정]: " + taxType);

                            boolean isValid = taxType != null && !taxType.equals("국세청에 등록되지 않은 사업자등록번호입니다.");
                            cache.put(cleanNum, new CacheEntry(isValid));
                            return isValid;
                        }
                    }
                }

                cache.put(cleanNum, new CacheEntry(false));
                return false;

            } catch (HttpClientErrorException | HttpServerErrorException e) {
                System.err.println("❌ [API HTTP 오류] 시도 " + attempt + " - 상태코드: " + e.getStatusCode() + ", 응답: " + e.getResponseBodyAsString());

                if (attempt < maxRetries) {
                    try {
                        long waitTime = attempt * 3000L;
                        System.out.println("⏳ " + (waitTime / 1000) + "초 후 재시도...");
                        Thread.sleep(waitTime);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            } catch (Exception e) {
                System.err.println("❌ [API 시스템 오류] 시도 " + attempt + ": " + e.getMessage());

                if (attempt < maxRetries) {
                    try {
                        long waitTime = attempt * 3000L;
                        System.out.println("⏳ " + (waitTime / 1000) + "초 후 재시도...");
                        Thread.sleep(waitTime);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        return false;
    }

    public Map<String, Object> checkBusinessNumberWithInfo(String businessNumber) {
        Map<String, Object> result = new HashMap<>();
        result.put("isValid", false);
        result.put("companyName", null);

        boolean isValid = checkBusinessNumber(businessNumber);
        result.put("isValid", isValid);
        return result;
    }
}
