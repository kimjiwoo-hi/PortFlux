package com.portflux.backend.repository;

import com.portflux.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    List<Cart> findByUserNumAndCartStatus(Long userNum, String cartStatus);

    Optional<Cart> findByUserNumAndPostIdAndCartStatus(Long userNum, Long postId, String cartStatus);
}