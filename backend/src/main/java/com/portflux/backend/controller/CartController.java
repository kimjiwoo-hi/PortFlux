package com.portflux.backend.controller;

import com.portflux.backend.model.Cart;
import com.portflux.backend.service.CartService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // TODO: 실무에서는 PathVariable 대신 @AuthenticationPrincipal 등으로 Spring Security context에서 사용자 정보를 얻어와야 합니다.
    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable("userId") Long userId) {
        List<Cart> cartItems = cartService.getCartItems(userId);
        
        List<CartItemResponse> itemResponses = cartItems.stream()
                .map(item -> new CartItemResponse(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getUnitPrice(),
                        item.getQty()))
                .collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(item -> item.getUnitPrice().multiply(new BigDecimal(item.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponse res = new CartResponse(itemResponses, total);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<CartItemResponse> addItemToCart(@PathVariable("userId") Long userId, @RequestBody AddItemRequest req) {
        Cart cartItem = cartService.addOrUpdateItem(userId, req.getProductId(), req.getProductName(), req.getUnitPrice(), req.getQty());
        CartItemResponse res = new CartItemResponse(cartItem.getId(), cartItem.getProductId(), cartItem.getProductName(), cartItem.getUnitPrice(), cartItem.getQty());
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/items/{cartId}")
    public ResponseEntity<CartItemResponse> updateCartItemQuantity(@PathVariable("cartId") Long cartId, @RequestBody UpdateQtyRequest req) {
        Cart updatedItem = cartService.updateItemQuantity(cartId, req.getQty());
        if (updatedItem == null) {
            // 수량이 0이 되어 아이템이 삭제된 경우
            return ResponseEntity.noContent().build();
        }
        CartItemResponse res = new CartItemResponse(updatedItem.getId(), updatedItem.getProductId(), updatedItem.getProductName(), updatedItem.getUnitPrice(), updatedItem.getQty());
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/items/{cartId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable("cartId") Long cartId) {
        cartService.deleteItem(cartId);
        return ResponseEntity.noContent().build();
    }


    // --- DTOs ---
    @Data
    public static class AddItemRequest {
        private Long productId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer qty;
    }

    @Data
    public static class UpdateQtyRequest {
        private Integer qty;
    }

    @Data
    public static class CartResponse {
        private List<CartItemResponse> items;
        private BigDecimal total;

        public CartResponse(List<CartItemResponse> items, BigDecimal total) {
            this.items = items;
            this.total = total;
        }
    }

    @Data
    public static class CartItemResponse {
        private Long cartId; // 프론트에서 아이템 구분을 위해 cartId 추가
        private Long productId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer qty;

        public CartItemResponse(Long cartId, Long productId, String productName, BigDecimal unitPrice, Integer qty) {
            this.cartId = cartId;
            this.productId = productId;
            this.productName = productName;
            this.unitPrice = unitPrice;
            this.qty = qty;
        }
    }
}