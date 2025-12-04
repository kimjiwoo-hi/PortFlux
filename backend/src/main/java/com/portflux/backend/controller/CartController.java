package com.portflux.backend.controller;

import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        // 임시: 샘플 장바구니 반환. 실제 구현에서는 DB/세션 기반 카트 조회로 변경하세요.
        CartItem item1 = new CartItem();
        item1.setProductId(101L);
        item1.setProductName("Example Product A");
        item1.setUnitPrice(new BigDecimal("15000"));
        item1.setQty(1);

        CartItem item2 = new CartItem();
        item2.setProductId(102L);
        item2.setProductName("Example Product B");
        item2.setUnitPrice(new BigDecimal("25000"));
        item2.setQty(2);

        List<CartItem> items = Arrays.asList(item1, item2);
        CartResponse res = new CartResponse();
        res.setItems(items);
        res.setTotal(items.stream().map(i -> i.getUnitPrice().multiply(new BigDecimal(i.getQty()))).reduce(BigDecimal.ZERO, BigDecimal::add));

        return ResponseEntity.ok(res);
    }

    @Data
    public static class CartResponse {
        private List<CartItem> items;
        private BigDecimal total;
    }

    @Data
    public static class CartItem {
        private Long productId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer qty;
    }
}
