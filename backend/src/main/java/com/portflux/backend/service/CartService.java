package com.portflux.backend.service;

import com.portflux.backend.model.Cart;
import com.portflux.backend.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;

    public List<Cart> getCartItems(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    @Transactional
    public Cart addOrUpdateItem(Long userId, Long productId, String productName, BigDecimal unitPrice, int qty) {
        Optional<Cart> existingItem = cartRepository.findByUserIdAndProductId(userId, productId);

        Cart cartItem;
        if (existingItem.isPresent()) {
            // 이미 상품이 장바구니에 있는 경우: 수량 추가
            cartItem = existingItem.get();
            cartItem.setQty(cartItem.getQty() + qty);
        } else {
            // 새로운 상품인 경우: 장바구니에 추가
            cartItem = new Cart();
            cartItem.setUserId(userId);
            cartItem.setProductId(productId);
            cartItem.setProductName(productName);
            cartItem.setUnitPrice(unitPrice);
            cartItem.setQty(qty);
        }
        return cartRepository.save(cartItem);
    }

    @Transactional
    public Cart updateItemQuantity(Long cartId, int qty) {
        Cart cartItem = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid cart item ID: " + cartId));
        
        if (qty <= 0) {
            // 수량이 0 이하인 경우 아이템 삭제
            cartRepository.delete(cartItem);
            return null;
        } else {
            cartItem.setQty(qty);
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