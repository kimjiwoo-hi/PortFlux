package com.portflux.backend.model;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "POST")
public class Post {

    @Id
    @Column(name = "POST_ID")
    private Long id;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Column(name = "PRICE")
    private BigDecimal price;

    // 참고: 장바구니 기능에 필요한 최소한의 필드만 추가했습니다.
    // POST 테이블의 다른 필드(content, created_at 등)는 필요에 따라 추가할 수 있습니다.
}
