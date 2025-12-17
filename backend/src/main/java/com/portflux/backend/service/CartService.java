package com.portflux.backend.service;

import com.portflux.backend.model.Cart;
import com.portflux.backend.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DELETED = "DELETED";

    private final CartRepository cartRepository;

    /** 유저 장바구니 조회 (ACTIVE만) */
    public List<Cart> getCartItems(Long userNum) {
        return cartRepository.findByUserNumAndCartStatus(userNum, STATUS_ACTIVE);
    }

    /**
     * 장바구니 담기/수량 증가
     * - 클라이언트에서 productName, unitPrice를 전달받음
     * - 서버가 Cart에 저장
     */
    @Transactional
    public Cart addOrUpdateItem(Long userNum, Long postId, int qty, String productName, BigDecimal unitPrice) {
        if (userNum == null)
            throw new IllegalArgumentException("userNum is required");
        if (postId == null)
            throw new IllegalArgumentException("postId is required");
        if (qty <= 0)
            throw new IllegalArgumentException("qty must be > 0");
        if (productName == null || productName.isEmpty())
            throw new IllegalArgumentException("productName is required");
        if (unitPrice == null || unitPrice.signum() < 0)
            throw new IllegalArgumentException("unitPrice must be non-negative");

        Optional<Cart> existingItem = cartRepository.findByUserNumAndPostIdAndCartStatus(userNum, postId,
                STATUS_ACTIVE);

        LocalDateTime now = LocalDateTime.now();

        Cart cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQty(cartItem.getQty() + qty);

            // 필요 시 가격 스냅샷을 최신 가격으로 갱신할지 정책 선택:
            // 1) 담은 시점 가격 유지(보통 권장) => 아래 두 줄 주석 유지
            // 2) 항상 최신 가격 반영 => 주석 해제
            // cartItem.setUnitPrice(unitPrice);
            // cartItem.setProductName(productName);

            cartItem.setUpdatedAt(now);
        } else {
            cartItem = new Cart();
            cartItem.setUserNum(userNum);
            cartItem.setPostId(postId);

            // 스냅샷(담은 시점 기준) 저장
            cartItem.setProductName(productName);
            cartItem.setUnitPrice(unitPrice);

            cartItem.setQty(qty);
            cartItem.setCartStatus(STATUS_ACTIVE);
            cartItem.setCreatedAt(now);
            cartItem.setUpdatedAt(now);
        }

        return cartRepository.save(cartItem);
    }

    /**
     * 수량 변경
     * - qty <= 0 이면 소프트 삭제(DELETED)
     */
    @Transactional
    public Cart updateItemQuantity(Long cartId, int qty) {
        if (cartId == null)
            throw new IllegalArgumentException("cartId is required");

        Cart cartItem = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid cart item ID: " + cartId));

        LocalDateTime now = LocalDateTime.now();

        if (qty <= 0) {
            cartItem.setCartStatus(STATUS_DELETED);
            cartItem.setUpdatedAt(now);
            cartRepository.save(cartItem);
            return null;
        }

        cartItem.setQty(qty);
        cartItem.setUpdatedAt(now);
        return cartRepository.save(cartItem);
    }

    /** 장바구니 항목 삭제(소프트 삭제) */
    @Transactional
    public void deleteItem(Long cartId) {
        if (cartId == null)
            throw new IllegalArgumentException("cartId is required");

        Cart cartItem = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid cart item ID: " + cartId));

        cartItem.setCartStatus(STATUS_DELETED);
        cartItem.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cartItem);
    }
}
