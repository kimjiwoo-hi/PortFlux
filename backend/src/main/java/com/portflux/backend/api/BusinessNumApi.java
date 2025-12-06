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
import org.springframework.web.client.RestTemplate;

@Component
public class BusinessNumApi {

    @Value("${api.public.data.service-key}")
    private String serviceKey;

    @Value("${api.public.data.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean checkBusinessNumber(String businessNumber) {
        try {
            URI uri = URI.create(apiUrl + "?serviceKey=" + serviceKey);

            Map<String, List<String>> requestBody = new HashMap<>();
            requestBody.put("b_no", Collections.singletonList(businessNumber.replace("-", "")));

            RequestEntity<Map<String, List<String>>> request = RequestEntity
                    .post(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody);

            ResponseEntity<Map> response = restTemplate.exchange(request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return true;
            }
            return false;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}