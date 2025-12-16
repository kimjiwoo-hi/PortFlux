package com.portflux.backend.model;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "CART")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CART_ID")
    private Long id;

    // TODO: 추후 User 엔티티와 ManyToOne 관계로 변경해야 합니다.
    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    // TODO: 추후 Product 엔티티와 ManyToOne 관계로 변경해야 합니다.
    @Column(name = "PRODUCT_ID", nullable = false)
    private Long productId;
    
    @Column(name = "PRODUCT_NAME", nullable = false)
    private String productName;

    @Column(name = "UNIT_PRICE", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "QTY", nullable = false)
    private Integer qty;
}
