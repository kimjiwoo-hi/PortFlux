package com.portflux.backend.repository;

import com.portflux.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    @Query("SELECT c FROM Cart c WHERE c.userId = :userId")
    List<Cart> findByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Cart c WHERE c.userId = :userId AND c.postId = :postId")
    Optional<Cart> findByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);
}