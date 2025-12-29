package com.portflux.backend.repository;

import com.portflux.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * 사용자 번호로 장바구니의 모든 항목을 조회합니다.
     * @param userNum 사용자 번호
     * @return 장바구니 항목 리스트
     */
    List<Cart> findByUserNum(Long userNum);

    /**
     * 사용자 번호와 게시글 번호로 특정 장바구니 항목이 존재하는지 확인합니다.
     * @param userNum 사용자 번호
     * @param postId 게시글 번호
     * @return Optional<Cart>
     */
    Optional<Cart> findByUserNumAndPostId(Long userNum, Long postId);
}