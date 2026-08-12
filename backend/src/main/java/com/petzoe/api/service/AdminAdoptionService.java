package com.petzoe.api.service;

import com.petzoe.api.dto.AdoptionPetDTO;
import com.petzoe.api.entity.AdoptionPet;
import com.petzoe.api.entity.AuditLog;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.AdoptionPetRepository;
import com.petzoe.api.repository.AuditLogRepository;
import com.petzoe.api.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminAdoptionService {
    
    private final AdoptionPetRepository adoptionPetRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AdminAdoptionService(AdoptionPetRepository adoptionPetRepository,
                                AuditLogRepository auditLogRepository,
                                UserRepository userRepository) {
        this.adoptionPetRepository = adoptionPetRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public List<AdoptionPetDTO> getPendingAdoptionPets() {
        return adoptionPetRepository.findByVerificationStatus(VerificationStatus.PENDING, Pageable.unpaged())
                .getContent().stream().map(AdoptionPetDTO::new).collect(Collectors.toList());
    }
    
    public AdoptionPetDTO approveAdoptionPet(Long id, String adminEmail) {
        AdoptionPet pet = adoptionPetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adoption pet not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        pet.setVerificationStatus(VerificationStatus.APPROVED);
        AdoptionPet saved = adoptionPetRepository.save(pet);
        
        auditLogRepository.save(new AuditLog(admin, "APPROVED_ADOPTION_PET", "AdoptionPet", saved.getId(), "Approved pet: " + saved.getName()));
        
        return new AdoptionPetDTO(saved);
    }
    
    public AdoptionPetDTO rejectAdoptionPet(Long id, String reason, String adminEmail) {
        AdoptionPet pet = adoptionPetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adoption pet not found"));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        pet.setVerificationStatus(VerificationStatus.REJECTED);
        AdoptionPet saved = adoptionPetRepository.save(pet);
        
        auditLogRepository.save(new AuditLog(admin, "REJECTED_ADOPTION_PET", "AdoptionPet", saved.getId(), "Rejected pet: " + saved.getName() + ". Reason: " + reason));
        
        return new AdoptionPetDTO(saved);
    }
}
