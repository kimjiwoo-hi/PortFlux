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
import java.util.Map;
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
    public ResponseEntity<CartItemResponse> addItemToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AddItemRequest req) {
        Long userNum = getUserNum(userDetails.getUsername());
        if (userNum == null) {
            return ResponseEntity.status(404).build();
        }

        Cart cartItem = cartService.addOrUpdateItem(userNum, req.getProductId());
        CartItemResponse res = new CartItemResponse(cartItem.getId(), cartItem.getUserId(), cartItem.getPostId());
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/items/{cartId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable("cartId") Long cartId) {
        cartService.deleteItem(cartId);
        return ResponseEntity.noContent().build();
    }

    /**
     * ✅ 장바구니 전체 비우기 엔드포인트
     */
    @DeleteMapping("/{userNum}/empty")
    public ResponseEntity<Map<String, Object>> emptyCart(@PathVariable Long userNum) {
        try {
            cartService.emptyCart(userNum);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "장바구니가 비워졌습니다."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "장바구니 비우기 실패: " + e.getMessage()
            ));
        }
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

        public CartResponse(List<CartItemResponse> items) {
            this.items = items;
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