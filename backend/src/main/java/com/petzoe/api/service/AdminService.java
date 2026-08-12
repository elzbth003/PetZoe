package com.petzoe.api.service;

import com.petzoe.api.dto.AdminStatsDTO;
import com.petzoe.api.entity.ProductStatus;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.AdoptionPetRepository;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VerificationRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AdoptionPetRepository adoptionPetRepository;
    private final VerificationRequestRepository verificationRequestRepository;

    public AdminService(UserRepository userRepository,
                        ProductRepository productRepository,
                        AdoptionPetRepository adoptionPetRepository,
                        VerificationRequestRepository verificationRequestRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.adoptionPetRepository = adoptionPetRepository;
        this.verificationRequestRepository = verificationRequestRepository;
    }

    public AdminStatsDTO getDashboardStats() {
        AdminStatsDTO stats = new AdminStatsDTO();
        
        stats.setTotalUsers(userRepository.count());
        
        long totalOwners = userRepository.findAll().stream()
                .filter(u -> "Pet Owner".equalsIgnoreCase(u.getRole()))
                .count();
        stats.setTotalPetOwners(totalOwners);

        long pendingVets = userRepository.findAll().stream()
                .filter(u -> "Veterinarian".equalsIgnoreCase(u.getRole()) && u.getVerificationStatus() == VerificationStatus.PENDING)
                .count();
        stats.setPendingVets(pendingVets);

        long verifiedVets = userRepository.findAll().stream()
                .filter(u -> "Veterinarian".equalsIgnoreCase(u.getRole()) && u.getVerificationStatus() == VerificationStatus.APPROVED)
                .count();
        stats.setVerifiedVets(verifiedVets);

        long pendingShelters = userRepository.findAll().stream()
                .filter(u -> "Shelter Manager".equalsIgnoreCase(u.getRole()) && u.getVerificationStatus() == VerificationStatus.PENDING)
                .count();
        stats.setPendingShelters(pendingShelters);

        long pendingSellers = userRepository.findAll().stream()
                .filter(u -> ("Marketplace Seller".equalsIgnoreCase(u.getRole()) || "Seller".equalsIgnoreCase(u.getRole())) 
                             && u.getVerificationStatus() == VerificationStatus.PENDING)
                .count();
        stats.setPendingSellers(pendingSellers);

        long pendingProducts = productRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProductStatus.PENDING_REVIEW)
                .count();
        stats.setPendingProducts(pendingProducts);

        long activeAdoptionPets = adoptionPetRepository.findByVerificationStatus(VerificationStatus.APPROVED, Pageable.unpaged()).getTotalElements();
        stats.setActiveAdoptionPets(activeAdoptionPets);

        return stats;
    }
}
