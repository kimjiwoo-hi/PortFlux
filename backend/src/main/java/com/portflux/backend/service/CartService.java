package com.portflux.backend.service;

import com.portflux.backend.model.Cart;
import com.portflux.backend.model.Post;
import com.portflux.backend.repository.PostRepository;
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
    private final PostRepository postRepository; // PostRepository 주입

    /** 유저 장바구니 조회 (ACTIVE만) */
    public List<Cart> getCartItems(Long userNum) {
        return cartRepository.findByUserNumAndCartStatus(userNum, STATUS_ACTIVE);
    }

    /**
     * 장바구니 담기/수량 증가
     * - 서버에서 직접 Post 정보를 조회하여 이름과 가격을 사용 (보안 강화)
     */
    @Transactional
    public Cart addOrUpdateItem(Long userNum, Long postId, int qty) {
        if (userNum == null)
            throw new IllegalArgumentException("userNum is required");
        if (postId == null)
            throw new IllegalArgumentException("postId is required");
        if (qty <= 0)
            throw new IllegalArgumentException("qty must be > 0");

        // 1. DB에서 Post 정보 조회 (보안: 클라이언트 가격을 믿지 않음)
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId));

        // 2. 가격이 없는 상품은 장바구니에 담을 수 없음 (예: 'job', 'free' 게시물)
        if (post.getPrice() == null) {
            throw new IllegalArgumentException("This item cannot be added to the cart because it does not have a price.");
        }
        
        String productName = post.getTitle();
        BigDecimal unitPrice = post.getPrice();

        Optional<Cart> existingItem = cartRepository.findByUserNumAndPostIdAndCartStatus(userNum, postId,
                STATUS_ACTIVE);

        LocalDateTime now = LocalDateTime.now();

        Cart cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQty(cartItem.getQty() + qty);
            
            // 항상 최신 가격과 이름으로 업데이트
            cartItem.setUnitPrice(unitPrice);
            cartItem.setProductName(productName);

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
