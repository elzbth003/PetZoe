package com.petzoe.api.service;

import com.petzoe.api.dto.AdminStatsDTO;
import com.petzoe.api.entity.AnimalStatus;
import com.petzoe.api.entity.ProductStatus;
import com.petzoe.api.entity.VerificationStatus;
import com.petzoe.api.repository.AnimalRepository;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VerificationRequestRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AnimalRepository animalRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    private final com.petzoe.api.repository.ShelterRepository shelterRepository;
    private final com.petzoe.api.repository.AdopterProfileRepository adopterProfileRepository;
    private final com.petzoe.api.repository.AdoptionApplicationRepository adoptionApplicationRepository;
    private final com.petzoe.api.repository.AdoptionListingRepository adoptionListingRepository;

    private final com.petzoe.api.repository.PetRepository petRepository;
    private final com.petzoe.api.repository.AppointmentRepository appointmentRepository;
    private final com.petzoe.api.repository.OrderRepository orderRepository;
    private final com.petzoe.api.repository.AiChatConversationRepository aiChatConversationRepository;
    private final com.petzoe.api.repository.AiChatMessageRepository aiChatMessageRepository;

    public AdminService(UserRepository userRepository,
                        ProductRepository productRepository,
                        AnimalRepository animalRepository,
                        VerificationRequestRepository verificationRequestRepository,
                        com.petzoe.api.repository.ShelterRepository shelterRepository,
                        com.petzoe.api.repository.AdopterProfileRepository adopterProfileRepository,
                        com.petzoe.api.repository.AdoptionApplicationRepository adoptionApplicationRepository,
                        com.petzoe.api.repository.AdoptionListingRepository adoptionListingRepository,
                        com.petzoe.api.repository.PetRepository petRepository,
                        com.petzoe.api.repository.AppointmentRepository appointmentRepository,
                        com.petzoe.api.repository.OrderRepository orderRepository,
                        com.petzoe.api.repository.AiChatConversationRepository aiChatConversationRepository,
                        com.petzoe.api.repository.AiChatMessageRepository aiChatMessageRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.animalRepository = animalRepository;
        this.verificationRequestRepository = verificationRequestRepository;
        this.shelterRepository = shelterRepository;
        this.adopterProfileRepository = adopterProfileRepository;
        this.adoptionApplicationRepository = adoptionApplicationRepository;
        this.adoptionListingRepository = adoptionListingRepository;
        this.petRepository = petRepository;
        this.appointmentRepository = appointmentRepository;
        this.orderRepository = orderRepository;
        this.aiChatConversationRepository = aiChatConversationRepository;
        this.aiChatMessageRepository = aiChatMessageRepository;
    }

    public AdminStatsDTO getDashboardStats() {
        AdminStatsDTO stats = new AdminStatsDTO();
        
        stats.setTotalUsers(userRepository.count());
        
        stats.setTotalPetOwners(userRepository.countByRoleIgnoreCase("Pet Owner"));
        stats.setPendingVets(userRepository.countByRoleIgnoreCaseAndVerificationStatus("Veterinarian", VerificationStatus.PENDING));
        stats.setVerifiedVets(userRepository.countByRoleIgnoreCaseAndVerificationStatus("Veterinarian", VerificationStatus.APPROVED));
        
        // Count pending shelters from shelterRepository or shelter managers with PENDING status
        long pendingShelterCount = shelterRepository.countByVerificationStatus(VerificationStatus.PENDING);
        if (pendingShelterCount == 0) {
            pendingShelterCount = userRepository.countByRoleIgnoreCaseAndVerificationStatus("Shelter Manager", VerificationStatus.PENDING);
        }
        stats.setPendingShelters(pendingShelterCount);

        stats.setPendingSellers(userRepository.countPendingSellers(VerificationStatus.PENDING));
        stats.setPendingProducts(productRepository.countByStatus(ProductStatus.PENDING_REVIEW));

        long activeAdoptionPets = animalRepository.countByStatus(AnimalStatus.READY_FOR_ADOPTION);
        stats.setActiveAdoptionPets(activeAdoptionPets);

        stats.setTotalShelters(shelterRepository.count());
        stats.setTotalAdopters(adopterProfileRepository.count());
        stats.setTotalAdoptionApplications(adoptionApplicationRepository.count());
        stats.setPendingAdoptionListings(adoptionListingRepository.countByStatus(VerificationStatus.PENDING));

        // Genuine operational metrics from respective repositories
        stats.setTotalPets(petRepository.count());
        stats.setTotalAppointments(appointmentRepository.count());
        stats.setCompletedAppointments(appointmentRepository.countByStatusIgnoreCase("COMPLETED"));
        stats.setPendingAppointments(appointmentRepository.countByStatusIgnoreCase("UPCOMING") + appointmentRepository.countByStatusIgnoreCase("PENDING"));
        stats.setCancelledAppointments(appointmentRepository.countByStatusIgnoreCase("CANCELLED"));

        stats.setTotalOrders(orderRepository.count());
        Double grossRevenue = orderRepository.calculateGrossDeliveredRevenue();
        stats.setGrossOrderRevenue(grossRevenue != null ? grossRevenue : 0.0);

        stats.setTotalAiConversations(aiChatConversationRepository.count());
        stats.setTotalAiMessages(aiChatMessageRepository.count());

        return stats;
    }
}
