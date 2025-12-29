package com.portflux.backend.controller;

import com.portflux.backend.model.Cart;
import com.portflux.backend.service.CartService;
import com.portflux.backend.repository.UserRepository;
import com.portflux.backend.beans.UserBean;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        UserBean user = userRepository.findByUserId(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        List<Cart> cartItems = cartService.getCartItems(Long.valueOf(user.getUserNum()));

        List<CartItemResponse> itemResponses = cartItems.stream()
                .map(item -> new CartItemResponse(
                        item.getId(),
                        item.getUserId(),
                        item.getPostId()))
                .collect(Collectors.toList());

        CartResponse res = new CartResponse(itemResponses);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> addItemToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AddItemRequest req) {
        UserBean user = userRepository.findByUserId(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        Cart cartItem = cartService.addOrUpdateItem(Long.valueOf(user.getUserNum()), req.getProductId());
        CartItemResponse res = new CartItemResponse(cartItem.getId(), cartItem.getUserId(), cartItem.getPostId());
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