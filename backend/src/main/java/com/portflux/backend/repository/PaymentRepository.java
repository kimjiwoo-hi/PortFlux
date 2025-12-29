
package com.portflux.backend.repository;

import com.portflux.backend.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentRecord, Long> {
    Optional<PaymentRecord> findByImpUid(String impUid);

    Optional<PaymentRecord> findByMerchantUid(String merchantUid);
}
