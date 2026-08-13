package com.petzoe.api.service;

import com.petzoe.api.dto.AdminVeterinarianListDTO;
import com.petzoe.api.dto.VeterinarianDetailDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminVeterinarianServiceTest {

    @Mock
    private VeterinarianProfileRepository profileRepository;
    @Mock
    private VerificationDocumentRepository documentRepository;
    @Mock
    private VerificationHistoryRepository historyRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminVeterinarianService adminVeterinarianService;

    private User adminUser;
    private User vetUser;
    private VeterinarianProfile vetProfile;
    private VerificationDocument document;

    @BeforeEach
    void setUp() {
        adminUser = new User("Admin", "admin@petzoe.com", "pass", "123", "Admin");
        adminUser.setId(1L);

        vetUser = new User("Vet", "vet@petzoe.com", "pass", "456", "Veterinarian");
        vetUser.setId(2L);
        vetUser.setVerificationStatus(VerificationStatus.PENDING);

        vetProfile = new VeterinarianProfile();
        vetProfile.setId(10L);
        vetProfile.setUser(vetUser);
        vetProfile.setSubmittedAt(LocalDateTime.now());

        document = new VerificationDocument();
        document.setId(100L);
        document.setVeterinarianProfile(vetProfile);
        document.setStatus(VerificationStatus.PENDING);
    }

    @Test
    void testGetAllVeterinarians() {
        when(profileRepository.findAll()).thenReturn(List.of(vetProfile));
        List<AdminVeterinarianListDTO> list = adminVeterinarianService.getAllVeterinarians();
        assertEquals(1, list.size());
        assertEquals("Vet", list.get(0).name());
    }

    @Test
    void testApproveVeterinarian_ThrowsIfNotUnderReview() {
        when(profileRepository.findById(10L)).thenReturn(Optional.of(vetProfile));
        when(userRepository.findByEmail("admin@petzoe.com")).thenReturn(Optional.of(adminUser));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            adminVeterinarianService.approveVeterinarian(10L, "admin@petzoe.com");
        });
        assertEquals("Profile must be UNDER_REVIEW before approval", exception.getMessage());
    }

    @Test
    void testApproveVeterinarian_ThrowsIfDocsNotApproved() {
        vetUser.setVerificationStatus(VerificationStatus.UNDER_REVIEW);
        when(profileRepository.findById(10L)).thenReturn(Optional.of(vetProfile));
        when(userRepository.findByEmail("admin@petzoe.com")).thenReturn(Optional.of(adminUser));
        when(documentRepository.findByVeterinarianProfileId(10L)).thenReturn(List.of(document));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            adminVeterinarianService.approveVeterinarian(10L, "admin@petzoe.com");
        });
        assertEquals("Cannot approve profile until all documents are APPROVED", exception.getMessage());
    }

    @Test
    void testApproveVeterinarian_Success() {
        vetUser.setVerificationStatus(VerificationStatus.UNDER_REVIEW);
        document.setStatus(VerificationStatus.APPROVED);
        
        when(profileRepository.findById(10L)).thenReturn(Optional.of(vetProfile));
        when(userRepository.findByEmail("admin@petzoe.com")).thenReturn(Optional.of(adminUser));
        when(documentRepository.findByVeterinarianProfileId(10L)).thenReturn(List.of(document));

        adminVeterinarianService.approveVeterinarian(10L, "admin@petzoe.com");

        assertEquals(VerificationStatus.APPROVED, vetUser.getVerificationStatus());
        verify(userRepository, times(1)).save(vetUser);
        verify(historyRepository, times(1)).save(any(VerificationHistory.class));
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
        verify(notificationService, times(1)).createNotification(eq(vetUser), anyString(), anyString(), eq("VERIFICATION"));
    }
}
