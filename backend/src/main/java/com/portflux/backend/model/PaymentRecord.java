package com.portflux.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENTS")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(unique = true, nullable = false)
    private String impUid;

    @Column(unique = true, nullable = false)
    private String merchantUid;

    private BigDecimal amount;

    private String status; // READY, PAID, CANCELLED, REFUNDED

    private LocalDateTime paidAt;

    @Lob
    private String rawResponse;
}