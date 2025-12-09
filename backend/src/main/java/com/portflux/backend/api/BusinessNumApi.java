package com.portflux.backend.api;

import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class BusinessNumApi {

    // 공공데이터포털 인증키 (Decoding된 상태의 키 사용)
    private final String SERVICE_KEY = "0cd27a9d76a27f3a84fc16ab97338a986645f0a388d99feb0379edb7f16c8ec2";
    
    // 국세청 사업자등록정보 상태조회 API URL
    private final String API_URL = "https://api.odcloud.kr/api/nts-businessman/v1/status";

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean checkBusinessNumber(String businessNumber) {
        try {
            if (businessNumber == null) return false;
            String cleanNum = businessNumber.replace("-", ""); // 하이픈 제거
            
            // 1. URL 생성 (쿼리 파라미터로 키와 리턴타입 설정)
            String urlString = API_URL + "?serviceKey=" + SERVICE_KEY + "&returnType=JSON";
            URI uri = new URI(urlString);
            
            // 2. 요청 바디 생성 (JSON)
            Map<String, List<String>> requestBody = new HashMap<>();
            requestBody.put("b_no", Collections.singletonList(cleanNum));

            // 3. 요청 엔티티 생성 (Header + Body)
            RequestEntity<Map<String, List<String>>> request = RequestEntity
                    .post(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody);

            // 4. API 호출
            ResponseEntity<Map> response = restTemplate.exchange(request, Map.class);

            // 5. 응답 처리
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();

                if (body.containsKey("data")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");
                    
                    if (dataList != null && !dataList.isEmpty()) {
                        Map<String, Object> data = dataList.get(0);
                        String taxType = (String) data.get("tax_type"); // 국세청 과세유형 판정

                        System.out.println("▶ [국세청 API 판정]: " + taxType);

                        // "국세청에 등록되지 않은..." 메시지가 아니면 유효한 사업자로 판단
                        if (taxType != null && !taxType.equals("국세청에 등록되지 않은 사업자등록번호입니다.")) {
                            return true;
                        }
                    }
                }
            }
            return false;

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("❌ [API HTTP 오류] 상태코드: " + e.getStatusCode());
            return false;
        } catch (Exception e) {
            System.err.println("❌ [API 시스템 오류]: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}