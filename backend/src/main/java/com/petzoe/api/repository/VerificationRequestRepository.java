package com.petzoe.api.repository;

import com.petzoe.api.entity.VerificationRequest;
import com.petzoe.api.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {
    List<VerificationRequest> findByEntityTypeAndStatus(String entityType, VerificationStatus status);
    List<VerificationRequest> findByStatus(VerificationStatus status);
    Optional<VerificationRequest> findByUserIdAndEntityType(Long userId, String entityType);
}
