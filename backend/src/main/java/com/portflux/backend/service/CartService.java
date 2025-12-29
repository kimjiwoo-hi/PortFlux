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
    private final BoardLookupService boardLookupService; // 게시물 정보 조회를 위해 주입

    /**
     * 사용자의 장바구니에 게시물을 추가합니다.
     * 이미 항목이 있는 경우 예외를 발생시킵니다.
     */
    public Cart addItem(Long userNum, Long postId) {
        // 이미 장바구니에 동일한 게시물이 있는지 확인
        Optional<Cart> existingItem = cartRepository.findByUserNumAndPostId(userNum, postId);
        if (existingItem.isPresent()) {
            throw new IllegalStateException("이미 장바구니에 담긴 항목입니다.");
        }

        // 새 장바구니 항목 생성 및 저장
        Cart newCartItem = new Cart(userNum, postId);
        return cartRepository.save(newCartItem);
    }

    /**
     * 사용자 번호로 장바구니의 모든 항목과 관련 게시물 정보를 함께 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<CartItemDto> getCartItems(Long userNum) {
        List<Cart> cartItems = cartRepository.findByUserNum(userNum);
        
        return cartItems.stream()
            .map(cartItem -> {
                // 각 cart item에 해당하는 post 정보를 가져옴
                BoardLookupPostDto post = boardLookupService.getPostById(cartItem.getPostId().intValue());
                if (post == null) {
                    // 게시물이 삭제되었거나 없는 경우 null을 반환하여 리스트에서 제외
                    return null;
                }
                // CartItemDto로 변환
                return CartItemDto.builder()
                        .cartId(cartItem.getCartId())
                        .postId((long) post.getPostId())
                        .title(post.getTitle())
                        .price(post.getPrice())
                        .postFile(post.getPostFile()) // 썸네일용
                        .userNickname(post.getUserNickname()) // 판매자 닉네임
                        .build();
            })
            .filter(item -> item != null) // null인 항목(게시물이 없는 경우)은 최종 리스트에서 제외
            .collect(Collectors.toList());
    }
    
    /**
     * 장바구니에서 특정 항목을 삭제합니다.
     */
    public void deleteItem(Long cartId) {
        if (!cartRepository.existsById(cartId)) {
            throw new IllegalArgumentException("Invalid cart item ID: " + cartId);
        }
        cartRepository.deleteById(cartId);
    }
}