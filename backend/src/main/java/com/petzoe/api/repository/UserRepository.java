package com.petzoe.api.repository;

import com.petzoe.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    Optional<User> findByGoogleId(String googleId);
    
    long countByRoleIgnoreCase(String role);
    long countByRoleIgnoreCaseAndVerificationStatus(String role, com.petzoe.api.entity.VerificationStatus status);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE (LOWER(u.role) = 'marketplace seller' OR LOWER(u.role) = 'seller') AND u.verificationStatus = :status")
    long countPendingSellers(com.petzoe.api.entity.VerificationStatus status);
}
