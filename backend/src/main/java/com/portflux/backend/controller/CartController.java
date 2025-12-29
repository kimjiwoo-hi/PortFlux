package com.portflux.backend.controller;

import com.portflux.backend.beans.UserBean;
import com.portflux.backend.service.CartService;
import com.portflux.backend.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List; // List import 추가
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService; // UserService 주입

    /**
     * 현재 로그인된 사용자의 장바구니에 게시물을 추가합니다.
     * 프론트엔드는 { "postId": 123 } 형태의 body를 전송합니다.
     */
    @PostMapping
    public ResponseEntity<?> addItemToCart(@RequestBody AddToCartRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인이 필요합니다."));
        }

        // Principal에서 userId(String)를 가져와 UserBean을 조회
        UserBean user = userService.getUserByUserId(principal.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "사용자 정보를 찾을 수 없습니다."));
        }

        // userNum과 postId를 사용하여 장바구니에 아이템 추가
        cartService.addItem(user.getUserNum(), request.getPostId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "장바구니에 추가되었습니다."));
    }

    /**
     * 현재 로그인된 사용자의 장바구니 목록을 조회합니다.
     */
    @GetMapping
    public ResponseEntity<?> getCartItems(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인이 필요합니다."));
        }

        UserBean user = userService.getUserByUserId(principal.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "사용자 정보를 찾을 수 없습니다."));
        }

        // 서비스에서 이미 DTO로 변환된 리스트를 받음
        List<com.portflux.backend.dto.CartItemDto> cartItems = cartService.getCartItems(user.getUserNum());
        
        return ResponseEntity.ok(cartItems);
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
    public static class AddToCartRequest {
        private Long postId;
    }
}