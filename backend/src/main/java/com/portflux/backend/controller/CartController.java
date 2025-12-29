package com.portflux.backend.controller;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.service.CartService;
import com.portflux.backend.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
                        item.getUserId(),
                        item.getPostId())) // Updated to new CartItemResponse
                .collect(Collectors.toList());

        // Total calculation removed as price/qty are not in Cart
        CartResponse res = new CartResponse(itemResponses);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<CartItemResponse> addItemToCart(@PathVariable("userId") Long userId, @RequestBody AddItemRequest req) {
        Cart cartItem = cartService.addOrUpdateItem(userId, req.getProductId()); // Updated call
        CartItemResponse res = new CartItemResponse(cartItem.getId(), cartItem.getUserId(), cartItem.getPostId()); // Updated response
        return ResponseEntity.ok(res);
    }

    /**
     * 이미 장바구니에 항목이 있을 때 발생하는 예외를 처리합니다.
     * @param ex IllegalStateException
     * @return 409 Conflict 응답
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleDuplicateCartItem(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }


    // --- DTO for Request Body ---
    @Data
    public static class AddItemRequest {
        private Long productId; // Now represents postId
    }

    @Data
    public static class CartResponse {
        private List<CartItemResponse> items;
        // private BigDecimal total; // Removed

        public CartResponse(List<CartItemResponse> items) { // Constructor updated
            this.items = items;
            // this.total = total; // Removed
        }
    }

    @Data
    public static class CartItemResponse {
        private Long cartId;
        private Long userId;
        private Long postId; // Represents the productId from frontend's perspective

        public CartItemResponse(Long cartId, Long userId, Long postId) {
            this.cartId = cartId;
            this.userId = userId;
            this.postId = postId;
        }
    }
}