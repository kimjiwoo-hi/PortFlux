package com.portflux.backend.service;

import com.portflux.backend.beans.BoardLookupPostDto;
import com.portflux.backend.dto.CartItemDto;
import com.portflux.backend.model.Cart;
import com.portflux.backend.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;

    public List<Cart> getCartItems(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    @Transactional
    public Cart addOrUpdateItem(Long userId, Long postId) {
        // DB 스키마에 따라, 동일 상품 중복 추가를 방지.
        Optional<Cart> existingItem = cartRepository.findByUserIdAndPostId(userId, postId);

        if (existingItem.isPresent()) {
            // 이미 상품이 장바구니에 있는 경우: 기존 아이템 반환 (또는 예외 처리)
            return existingItem.get();
        } else {
            // 새로운 상품인 경우: 장바구니에 추가
            Cart cartItem = new Cart();
            cartItem.setUserId(userId);
            cartItem.setPostId(postId);
            return cartRepository.save(cartItem);
        }
    }

    @Transactional
    public void deleteItem(Long cartId) {
        if (!cartRepository.existsById(cartId)) {
            throw new IllegalArgumentException("Invalid cart item ID: " + cartId);
        }
        cartRepository.deleteById(cartId);
    }
}