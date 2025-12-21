
package com.portflux.backend.repository;

import com.portflux.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByImpUid(String impUid);

    Optional<Payment> findByMerchantUid(String merchantUid);
}
