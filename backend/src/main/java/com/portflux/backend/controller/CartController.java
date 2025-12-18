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
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CartController {

    private final CartService cartService;

    /**
     * 장바구니 조회
     * GET /api/cart/{userNum}
     */
    @GetMapping("/{userNum}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Long userNum) {

        List<Cart> cartItems = cartService.getCartItems(userNum);

        List<CartItemResponse> items = cartItems.stream()
                .map(item -> {
                    BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                    Integer qty = item.getQty() != null ? item.getQty() : 0;
                    BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(qty));

                    return new CartItemResponse(
                            item.getId(),
                            item.getPostId(),
                            item.getProductName(),
                            unitPrice,
                            qty,
                            subtotal);
                })
                .collect(Collectors.toList());

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(new CartResponse(items, totalAmount));
    }

    /**
     * 장바구니 담기
     * POST /api/cart/{userNum}/items
     */
    @PostMapping("/{userNum}/items")
    public ResponseEntity<CartItemResponse> addItemToCart(
            @PathVariable Long userNum,
            @RequestBody AddItemRequest request) {
        Cart cart = cartService.addOrUpdateItem(
                userNum,
                request.getPostId(),
                request.getQty());

        CartItemResponse response = new CartItemResponse(
                cart.getId(),
                cart.getPostId(),
                cart.getProductName(),
                cart.getUnitPrice(),
                cart.getQty(),
                cart.getUnitPrice().multiply(BigDecimal.valueOf(cart.getQty())));

        return ResponseEntity.ok(response);
    }

    /**
     * 장바구니 수량 변경
     * PATCH /api/cart/items/{cartId}
     */
    @PatchMapping("/items/{cartId}")
    public ResponseEntity<CartItemResponse> updateCartQuantity(
            @PathVariable Long cartId,
            @RequestBody UpdateQtyRequest request) {
        Cart cart = cartService.updateItemQuantity(cartId, request.getQty());

        // qty <= 0 → 소프트 삭제 → 응답 없음
        if (cart == null) {
            return ResponseEntity.noContent().build();
        }

        CartItemResponse response = new CartItemResponse(
                cart.getId(),
                cart.getPostId(),
                cart.getProductName(),
                cart.getUnitPrice(),
                cart.getQty(),
                cart.getUnitPrice().multiply(BigDecimal.valueOf(cart.getQty())));

        return ResponseEntity.ok(response);
    }

    /**
     * 장바구니 삭제 (소프트 삭제)
     * DELETE /api/cart/items/{cartId}
     */
    @DeleteMapping("/items/{cartId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable Long cartId) {
        cartService.deleteItem(cartId);
        return ResponseEntity.noContent().build();
    }

    /*
     * =========================
     * DTO 정의
     * =========================
     */

    /** 장바구니 담기 요청 */
    @Data
    public static class AddItemRequest {
        private Long postId;
        private Integer qty;
    }

    /** 수량 변경 요청 */
    @Data
    public static class UpdateQtyRequest {
        private Integer qty;
    }

    /** 장바구니 전체 응답 */
    @Data
    public static class CartResponse {
        private List<CartItemResponse> items;
        private BigDecimal totalAmount;

        public CartResponse(List<CartItemResponse> items, BigDecimal totalAmount) {
            this.items = items;
            this.totalAmount = totalAmount;
        }
    }

    /** 장바구니 아이템 응답 */
    @Data
    public static class CartItemResponse {
        private Long cartId;
        private Long postId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer qty;
        private BigDecimal subtotal;

        public CartItemResponse(
                Long cartId,
                Long postId,
                String productName,
                BigDecimal unitPrice,
                Integer qty,
                BigDecimal subtotal) {
            this.cartId = cartId;
            this.postId = postId;
            this.productName = productName;
            this.unitPrice = unitPrice;
            this.qty = qty;
            this.subtotal = subtotal;
        }
    }
}
