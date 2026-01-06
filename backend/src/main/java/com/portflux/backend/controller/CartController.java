package com.portflux.backend.controller;

import com.portflux.backend.model.Cart;
import com.portflux.backend.service.CartService;
import com.portflux.backend.repository.UserRepository;
import com.portflux.backend.beans.UserBean;
import com.portflux.backend.beans.CompanyUserBean;
import com.portflux.backend.mapper.CompanyUserMapper;
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
    private final CompanyUserMapper companyUserMapper;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userNum = getUserNum(userDetails.getUsername());
        if (userNum == null) {
            return ResponseEntity.status(404).build();
        }

        List<Cart> cartItems = cartService.getCartItems(userNum);

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
    public ResponseEntity<?> addItemToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AddItemRequest req) {
        Long userNum = getUserNum(userDetails.getUsername());
        if (userNum == null) {
            return ResponseEntity.status(404).build();
        }

        try {
            Cart cartItem = cartService.addOrUpdateItem(userNum, req.getProductId());
            CartItemResponse res = new CartItemResponse(cartItem.getId(), cartItem.getUserId(), cartItem.getPostId());
            return ResponseEntity.ok(res);
        } catch (IllegalStateException e) {
            // 이미 구매한 상품인 경우
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/items/{cartId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable("cartId") Long cartId) {
        cartService.deleteItem(cartId);
        return ResponseEntity.noContent().build();
    }

    // 일반 유저 또는 기업 유저의 userNum 가져오기
    private Long getUserNum(String username) {
        UserBean user = userRepository.findByUserId(username);
        if (user != null) {
            return Long.valueOf(user.getUserNum());
        }
        CompanyUserBean company = companyUserMapper.getCompanyUserInfo(username);
        if (company != null) {
            return company.getCompanyNum();
        }
        return null;
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

    @Data
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}