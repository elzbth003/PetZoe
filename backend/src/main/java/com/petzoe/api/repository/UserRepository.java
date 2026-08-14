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

    @org.springframework.data.jpa.repository.Query("SELECT CAST(u.createdAt AS java.time.LocalDate), COUNT(u) FROM User u WHERE u.createdAt >= :since GROUP BY CAST(u.createdAt AS java.time.LocalDate) ORDER BY CAST(u.createdAt AS java.time.LocalDate)")
    java.util.List<Object[]> countDailyRegistrations(java.time.LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    java.util.List<Object[]> countByRoleGrouped();

    @org.springframework.data.jpa.repository.Query("SELECT u.verificationStatus, COUNT(u) FROM User u WHERE u.verificationStatus IS NOT NULL GROUP BY u.verificationStatus")
    java.util.List<Object[]> countByVerificationStatusGrouped();
}
