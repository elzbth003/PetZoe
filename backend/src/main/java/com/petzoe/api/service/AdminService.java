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
        
        stats.setTotalPetOwners(userRepository.countByRoleIgnoreCase("Pet Owner"));
        stats.setPendingVets(userRepository.countByRoleIgnoreCaseAndVerificationStatus("Veterinarian", VerificationStatus.PENDING));
        stats.setVerifiedVets(userRepository.countByRoleIgnoreCaseAndVerificationStatus("Veterinarian", VerificationStatus.APPROVED));
        stats.setPendingShelters(userRepository.countByRoleIgnoreCaseAndVerificationStatus("Shelter Manager", VerificationStatus.PENDING));
        stats.setPendingSellers(userRepository.countPendingSellers(VerificationStatus.PENDING));
        stats.setPendingProducts(productRepository.countByStatus(ProductStatus.PENDING_REVIEW));

        long activeAdoptionPets = adoptionPetRepository.findByVerificationStatus(VerificationStatus.APPROVED, Pageable.unpaged()).getTotalElements();
        stats.setActiveAdoptionPets(activeAdoptionPets);

        return stats;
    }
}
