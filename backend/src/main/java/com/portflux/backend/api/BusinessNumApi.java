package com.portflux.backend.api;

import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class BusinessNumApi {

    // 공공데이터포털 인증키 (application.properties에서 주입)
    @Value("${api.public.data.service-key}")
    private String SERVICE_KEY;

    // 국세청 사업자등록정보 상태조회 API URL (application.properties에서 주입)
    @Value("${api.public.data.url}")
    private String API_URL;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 사업자번호 검증 및 기업 정보 조회 (validate API 사용)
     * @param businessNumber 사업자번호
     * @return Map with "isValid" (boolean) and "companyName" (String)
     */
    public Map<String, Object> checkBusinessNumberWithInfo(String businessNumber) {
        Map<String, Object> result = new HashMap<>();
        result.put("isValid", false);
        result.put("companyName", null);

        try {
            System.out.println("====== 사업자번호 검증 시작 (validate API) ======");
            System.out.println("입력된 사업자번호: " + businessNumber);

            if (businessNumber == null) {
                System.out.println("❌ 사업자번호가 null입니다.");
                return result;
            }

            String cleanNum = businessNumber.replace("-", ""); // 하이픈 제거
            System.out.println("하이픈 제거 후: " + cleanNum);
            System.out.println("SERVICE_KEY: " + (SERVICE_KEY != null ? "설정됨 (길이: " + SERVICE_KEY.length() + ")" : "null"));
            System.out.println("API_URL: " + API_URL);

            // 1. URL 생성
            String urlString = API_URL + "?serviceKey=" + SERVICE_KEY;
            System.out.println("요청 URL: " + urlString);
            URI uri = new URI(urlString);

            // 2. 요청 바디 생성 (validate API는 businesses 배열 사용)
            // 빈 필드 제거 - 필수 필드만 전송
            Map<String, Object> business = new HashMap<>();
            business.put("b_no", cleanNum);
            // start_dt, p_nm 등 선택적 필드는 빈 값 대신 아예 포함하지 않음

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("businesses", Collections.singletonList(business));
            System.out.println("요청 바디: " + requestBody);

            // 3. 요청 엔티티 생성 (Header + Body)
            RequestEntity<Map<String, Object>> request = RequestEntity
                    .post(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody);

            // 4. API 호출
            System.out.println("국세청 validate API 호출 중...");
            ResponseEntity<Map> response = restTemplate.exchange(request, Map.class);
            System.out.println("응답 상태코드: " + response.getStatusCode());
            System.out.println("응답 바디: " + response.getBody());

            // 5. 응답 처리
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();

                if (body.containsKey("data")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");

                    if (dataList != null && !dataList.isEmpty()) {
                        Map<String, Object> data = dataList.get(0);
                        System.out.println("▶ [전체 데이터]: " + data);

                        String valid = (String) data.get("valid");  // "01": 유효, "02": 무효
                        String validMsg = (String) data.get("valid_msg");

                        System.out.println("▶ [국세청 validate API 판정]");
                        System.out.println("  - valid: " + valid);
                        System.out.println("  - valid_msg: " + validMsg);

                        // request_param 안에 기업명이 있을 수 있음
                        Object companyNameObj = null;
                        if (data.containsKey("request_param")) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> requestParam = (Map<String, Object>) data.get("request_param");
                            companyNameObj = requestParam.get("b_nm");
                            System.out.println("  - request_param.b_nm: " + companyNameObj);
                        }

                        // 다른 필드명도 시도
                        if (companyNameObj == null || companyNameObj.toString().trim().isEmpty()) {
                            companyNameObj = data.get("b_nm");
                        }
                        if (companyNameObj == null || companyNameObj.toString().trim().isEmpty()) {
                            companyNameObj = data.get("company");
                        }

                        System.out.println("  - 최종 기업명: " + companyNameObj);

                        // valid가 "01"이면 유효한 사업자
                        boolean isValid = "01".equals(valid);

                        if (isValid) {
                            System.out.println("✅ 유효한 사업자번호입니다.");
                            result.put("isValid", true);
                            if (companyNameObj != null && !companyNameObj.toString().trim().isEmpty()) {
                                result.put("companyName", companyNameObj.toString());
                            }
                            return result;
                        } else {
                            System.out.println("❌ 유효하지 않은 사업자번호입니다. (valid: " + valid + ", msg: " + validMsg + ")");
                        }
                    } else {
                        System.out.println("❌ 응답 데이터 리스트가 비어있습니다.");
                    }
                } else {
                    System.out.println("❌ 응답에 'data' 필드가 없습니다. 전체 응답: " + body);
                }
            } else {
                System.out.println("❌ API 응답 실패 또는 응답 바디가 null입니다.");
            }
            System.out.println("====== 사업자번호 검증 종료 (결과: false) ======");
            return result;

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("❌ [API HTTP 오류] 상태코드: " + e.getStatusCode());
            System.err.println("응답 바디: " + e.getResponseBodyAsString());
            return result;
        } catch (Exception e) {
            System.err.println("❌ [API 시스템 오류]: " + e.getMessage());
            e.printStackTrace();
            return result;
        }
    }

    public boolean checkBusinessNumber(String businessNumber) {
        try {
            System.out.println("====== 사업자번호 검증 시작 (status API) ======");
            System.out.println("입력된 사업자번호: " + businessNumber);

            if (businessNumber == null) {
                System.out.println("❌ 사업자번호가 null입니다.");
                return false;
            }

            String cleanNum = businessNumber.replace("-", ""); // 하이픈 제거
            System.out.println("하이픈 제거 후: " + cleanNum);
            System.out.println("SERVICE_KEY: " + (SERVICE_KEY != null ? "설정됨 (길이: " + SERVICE_KEY.length() + ")" : "null"));
            System.out.println("API_URL: " + API_URL);

            // status API 형식: b_no 배열로 전송
            String urlString = API_URL + "?serviceKey=" + SERVICE_KEY;
            System.out.println("요청 URL: " + urlString);
            URI uri = new URI(urlString);

            // status API 형식으로 요청 바디 생성
            Map<String, List<String>> requestBody = new HashMap<>();
            requestBody.put("b_no", Collections.singletonList(cleanNum));
            System.out.println("요청 바디: " + requestBody);

            // 3. 요청 엔티티 생성 (Header + Body)
            RequestEntity<Map<String, List<String>>> request = RequestEntity
                    .post(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody);

            // 4. API 호출
            System.out.println("국세청 status API 호출 중...");
            ResponseEntity<Map> response = restTemplate.exchange(request, Map.class);
            System.out.println("응답 상태코드: " + response.getStatusCode());
            System.out.println("응답 바디: " + response.getBody());

            // 5. 응답 처리
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();

                if (body.containsKey("data")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");

                    if (dataList != null && !dataList.isEmpty()) {
                        Map<String, Object> data = dataList.get(0);
                        System.out.println("▶ [전체 데이터]: " + data);

                        // status API는 tax_type 필드로 판정
                        String taxType = (String) data.get("tax_type");
                        String bStt = (String) data.get("b_stt");

                        System.out.println("▶ [국세청 status API 판정]");
                        System.out.println("  - tax_type: " + taxType);
                        System.out.println("  - b_stt (사업자상태): " + bStt);

                        // "국세청에 등록되지 않은..." 메시지가 아니면 유효한 사업자로 판단
                        if (taxType != null && !taxType.contains("국세청에 등록되지 않은")) {
                            System.out.println("✅ 유효한 사업자번호입니다.");
                            return true;
                        } else {
                            System.out.println("❌ 유효하지 않은 사업자번호입니다. (tax_type: " + taxType + ")");
                        }
                    } else {
                        System.out.println("❌ 응답 데이터 리스트가 비어있습니다.");
                    }
                } else {
                    System.out.println("❌ 응답에 'data' 필드가 없습니다. 전체 응답: " + body);
                }
            } else {
                System.out.println("❌ API 응답 실패 또는 응답 바디가 null입니다.");
            }
            System.out.println("====== 사업자번호 검증 종료 (결과: false) ======");
            return false;

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("❌ [API HTTP 오류] 상태코드: " + e.getStatusCode());
            System.err.println("응답 바디: " + e.getResponseBodyAsString());
            System.out.println("====== 사업자번호 검증 종료 (HTTP 오류) ======");
            return false;
        } catch (Exception e) {
            System.err.println("❌ [API 시스템 오류]: " + e.getMessage());
            e.printStackTrace();
            System.out.println("====== 사업자번호 검증 종료 (시스템 오류) ======");
            return false;
        }
    }
}