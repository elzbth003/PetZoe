package com.petzoe.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petzoe.api.dto.vetscan.*;
import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VetScanRecord;
import com.petzoe.api.repository.AppointmentRepository;
import com.petzoe.api.repository.PetRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VetScanRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VetScanServiceTest {

    @Mock
    private VetScanRecordRepository vetScanRecordRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private NotificationService notificationService;

    private ObjectMapper objectMapper;
    private VetScanService vetScanService;

    private User owner;
    private User anotherUser;
    private User veterinarian;
    private Pet dog;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        vetScanService = new VetScanService(
                vetScanRecordRepository,
                petRepository,
                userRepository,
                appointmentRepository,
                notificationService,
                objectMapper
        );

        owner = new User("Alex Carter", "owner@petverse.com", "pass", "123", "Pet Owner");
        owner.setId(1L);

        anotherUser = new User("Attacker", "attacker@petverse.com", "pass", "456", "Pet Owner");
        anotherUser.setId(2L);

        veterinarian = new User("Dr. Smith", "vet@petverse.com", "pass", "789", "Veterinarian");
        veterinarian.setId(3L);

        dog = new Pet("Bruno", "Dog", "Golden Retriever", 3, "Male", 25.0, "Up-to-date",
                "http://photo.jpg", null, "Golden", "None", "Healthy", owner);
        dog.setId(10L);
    }

    @Test
    @DisplayName("VETSCAN-TEST-01: Ownership verification prevents unauthorized user scanning another user's pet")
    void testOwnershipSecurityCheck() {
        MockMultipartFile file = new MockMultipartFile(
                "image", "lesion.jpg", "image/jpeg", new byte[]{1, 2, 3, 4}
        );

        when(userRepository.findByEmail("attacker@petverse.com")).thenReturn(Optional.of(anotherUser));
        when(petRepository.findById(10L)).thenReturn(Optional.of(dog));

        assertThrows(SecurityException.class, () ->
                vetScanService.analyzeScan(file, 10L, "{}", "attacker@petverse.com")
        );

        verify(vetScanRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("VETSCAN-TEST-02: Rejects disallowed file MIME types like executable or PDF")
    void testDisallowedMimeTypeRejection() {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "image", "document.pdf", "application/pdf", new byte[]{1, 2, 3}
        );

        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));
        when(petRepository.findById(10L)).thenReturn(Optional.of(dog));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                vetScanService.analyzeScan(pdfFile, 10L, "{}", "owner@petverse.com")
        );

        assertTrue(ex.getMessage().contains("Invalid file format"));
        verify(vetScanRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("VETSCAN-TEST-03: Empty file triggers validation error")
    void testEmptyFileRejection() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "image", "empty.jpg", "image/jpeg", new byte[]{}
        );

        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));
        when(petRepository.findById(10L)).thenReturn(Optional.of(dog));

        assertThrows(IllegalArgumentException.class, () ->
                vetScanService.analyzeScan(emptyFile, 10L, "{}", "owner@petverse.com")
        );
    }

    @Test
    @DisplayName("VETSCAN-TEST-04: Successful scan creation establishes baseline and dispatches notification")
    void testSuccessfulScanCreation() throws IOException {
        MockMultipartFile validImage = new MockMultipartFile(
                "image", "canine_lesion.jpg", "image/jpeg", new byte[]{10, 20, 30, 40, 50}
        );

        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));
        when(petRepository.findById(10L)).thenReturn(Optional.of(dog));
        when(vetScanRecordRepository.findTopByPetAndStatusOrderByCreatedAtDesc(dog, "COMPLETED"))
                .thenReturn(Optional.empty());

        when(vetScanRecordRepository.save(any(VetScanRecord.class))).thenAnswer(invocation -> {
            VetScanRecord rec = invocation.getArgument(0);
            rec.setId(101L);
            return rec;
        });

        VetScanResponseDTO response = vetScanService.analyzeScan(validImage, 10L, "{\"itching\": true}", "owner@petverse.com");

        assertNotNull(response);
        assertEquals(101L, response.id());
        assertEquals("Bruno", response.petName());
        assertEquals("BASELINE", response.progressionStatus());
        assertNotNull(response.predictions());
        assertFalse(response.predictions().isEmpty());
        assertTrue(response.clinicalDisclaimer().contains("PetZoe VetScan"));

        verify(notificationService).createNotification(eq(owner), contains("Screening Complete"), anyString(), eq("VETSCAN"));
    }

    @Test
    @DisplayName("VETSCAN-TEST-05: Verified veterinarian can record clinical review and notes")
    void testVeterinarianReviewSuccess() {
        VetScanRecord scan = new VetScanRecord();
        scan.setId(201L);
        scan.setPet(dog);
        scan.setOwner(owner);
        scan.setStatus("COMPLETED");

        when(userRepository.findByEmail("vet@petverse.com")).thenReturn(Optional.of(veterinarian));
        when(vetScanRecordRepository.findById(201L)).thenReturn(Optional.of(scan));
        when(vetScanRecordRepository.save(any(VetScanRecord.class))).thenAnswer(i -> i.getArgument(0));

        VetScanReviewRequestDTO reviewReq = new VetScanReviewRequestDTO("AGREE", "Typical superficial pyoderma erythema.");
        VetScanResponseDTO response = vetScanService.reviewScan(201L, reviewReq, "vet@petverse.com");

        assertNotNull(response);
        assertEquals("AGREE", response.veterinarianReviewStatus());
        assertEquals("Dr. Smith", response.veterinarianName());
        assertEquals("Typical superficial pyoderma erythema.", response.veterinarianNotes());

        verify(notificationService).createNotification(eq(owner), contains("Veterinarian Reviewed"), anyString(), eq("VETSCAN"));
    }

    @Test
    @DisplayName("VETSCAN-TEST-06: Non-veterinarian user cannot review VetScan records")
    void testNonVeterinarianReviewRejected() {
        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));

        VetScanReviewRequestDTO reviewReq = new VetScanReviewRequestDTO("AGREE", "Notes");

        assertThrows(AccessDeniedException.class, () ->
                vetScanService.reviewScan(201L, reviewReq, "owner@petverse.com")
        );

        verify(vetScanRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("VETSCAN-TEST-07: Scan comparison accurately evaluates probability differences")
    void testScanComparison() {
        VetScanRecord prev = new VetScanRecord();
        prev.setId(100L);
        prev.setPet(dog);
        prev.setOwner(owner);
        prev.setStatus("COMPLETED");
        prev.setProgressionStatus("BASELINE");
        prev.setPredictionsJson("""
            [
              {"label": "ERYTHEMA", "displayName": "Erythema", "probability": 0.85, "detected": true, "threshold": 0.50},
              {"label": "EROSION_ULCER", "displayName": "Erosion / Ulcer", "probability": 0.40, "detected": false, "threshold": 0.50}
            ]
        """);

        VetScanRecord curr = new VetScanRecord();
        curr.setId(101L);
        curr.setPet(dog);
        curr.setOwner(owner);
        curr.setStatus("COMPLETED");
        curr.setProgressionStatus("IMPROVING");
        curr.setPredictionsJson("""
            [
              {"label": "ERYTHEMA", "displayName": "Erythema", "probability": 0.45, "detected": false, "threshold": 0.50},
              {"label": "EROSION_ULCER", "displayName": "Erosion / Ulcer", "probability": 0.10, "detected": false, "threshold": 0.50}
            ]
        """);

        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));
        when(vetScanRecordRepository.findById(101L)).thenReturn(Optional.of(curr));
        when(vetScanRecordRepository.findById(100L)).thenReturn(Optional.of(prev));

        VetScanComparisonDTO comp = vetScanService.compareScans(101L, 100L, "owner@petverse.com");

        assertNotNull(comp);
        assertEquals("IMPROVING", comp.progressionStatus());
        assertFalse(comp.metricChanges().isEmpty());

        LesionChangeMetricDTO erythemaMetric = comp.metricChanges().stream()
                .filter(m -> "ERYTHEMA".equals(m.label()))
                .findFirst().orElseThrow();

        assertEquals(0.85, erythemaMetric.previousProbability());
        assertEquals(0.45, erythemaMetric.currentProbability());
        assertEquals(-0.40, erythemaMetric.delta());
        assertEquals("DECREASED", erythemaMetric.trend());
    }

    @Test
    @DisplayName("VETSCAN-TEST-08: Rejects non-canine images (e.g. vibrant blue objects / scenery)")
    void testNonCanineImageRejected() throws IOException {
        // Create 200x200 blue image (simulating a blue car or non-pet scene)
        BufferedImage blueImg = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = blueImg.createGraphics();
        g.setColor(new Color(20, 80, 220));
        g.fillRect(0, 0, 200, 200);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(blueImg, "jpg", baos);
        byte[] blueBytes = baos.toByteArray();

        MockMultipartFile file = new MockMultipartFile("image", "blue_car.jpg", "image/jpeg", blueBytes);

        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));
        when(petRepository.findById(10L)).thenReturn(Optional.of(dog));
        when(vetScanRecordRepository.save(any(VetScanRecord.class))).thenAnswer(i -> {
            VetScanRecord r = i.getArgument(0);
            r.setId(301L);
            return r;
        });

        VetScanResponseDTO response = vetScanService.analyzeScan(file, 10L, "{}", "owner@petverse.com");

        assertNotNull(response);
        assertEquals("INSUFFICIENT_IMAGE", response.status());
        assertTrue(response.statusMessage().contains("does not appear to be a canine skin or pet lesion photograph"));
        assertTrue(response.predictions().isEmpty());
        assertNull(response.explanationImageReference());

        verify(notificationService).createNotification(eq(owner), contains("Clearer Photo Required"), anyString(), eq("VETSCAN"));
    }

    @Test
    @DisplayName("VETSCAN-TEST-09: Rejects underexposed / dark images")
    void testDarkImageRejected() throws IOException {
        // Create 200x200 almost pitch black image
        BufferedImage darkImg = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = darkImg.createGraphics();
        g.setColor(new Color(5, 5, 5));
        g.fillRect(0, 0, 200, 200);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(darkImg, "jpg", baos);
        byte[] darkBytes = baos.toByteArray();

        MockMultipartFile file = new MockMultipartFile("image", "dark.jpg", "image/jpeg", darkBytes);

        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));
        when(petRepository.findById(10L)).thenReturn(Optional.of(dog));
        when(vetScanRecordRepository.save(any(VetScanRecord.class))).thenAnswer(i -> {
            VetScanRecord r = i.getArgument(0);
            r.setId(302L);
            return r;
        });

        VetScanResponseDTO response = vetScanService.analyzeScan(file, 10L, "{}", "owner@petverse.com");

        assertNotNull(response);
        assertEquals("INSUFFICIENT_IMAGE", response.status());
        assertTrue(response.statusMessage().contains("underexposed / too dark"));
    }

    @Test
    @DisplayName("VETSCAN-TEST-10: Generates Grad-CAM overlay for canine lesion photo on completion")
    void testGradCamOverlayGeneratedOnCompletedScan() throws IOException {
        // Create 200x200 skin/lesion image with warm background and red erythema patch
        BufferedImage skinImg = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = skinImg.createGraphics();
        g.setColor(new Color(220, 185, 150)); // Canine tan/skin background
        g.fillRect(0, 0, 200, 200);
        g.setColor(new Color(210, 45, 45));   // Erythema lesion spot
        g.fillOval(50, 50, 100, 100);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(skinImg, "jpg", baos);
        byte[] skinBytes = baos.toByteArray();

        MockMultipartFile file = new MockMultipartFile("image", "lesion.jpg", "image/jpeg", skinBytes);

        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));
        when(petRepository.findById(10L)).thenReturn(Optional.of(dog));
        when(vetScanRecordRepository.findTopByPetAndStatusOrderByCreatedAtDesc(dog, "COMPLETED"))
                .thenReturn(Optional.empty());
        when(vetScanRecordRepository.save(any(VetScanRecord.class))).thenAnswer(i -> {
            VetScanRecord r = i.getArgument(0);
            r.setId(303L);
            return r;
        });

        VetScanResponseDTO response = vetScanService.analyzeScan(file, 10L, "{}", "owner@petverse.com");

        assertNotNull(response);
        assertEquals("COMPLETED", response.status());
        assertNotNull(response.explanationImageReference());
        assertTrue(response.explanationImageReference().endsWith("-gradcam.png"));
    }

    @Test
    @DisplayName("VETSCAN-TEST-11: Rejects QR codes, barcodes, and high-contrast synthetic graphics")
    void testQrCodeOrDocumentRejected() throws IOException {
        // Create 200x200 simulated QR code (black and white blocks)
        BufferedImage qrImg = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = qrImg.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, 200, 200);
        g.setColor(Color.BLACK);
        // Draw black QR-like modules
        for (int i = 0; i < 200; i += 20) {
            for (int j = 0; j < 200; j += 20) {
                if ((i + j) % 40 == 0) {
                    g.fillRect(i, j, 15, 15);
                }
            }
        }
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(qrImg, "png", baos);
        byte[] qrBytes = baos.toByteArray();

        MockMultipartFile file = new MockMultipartFile("image", "qr_code.png", "image/png", qrBytes);

        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));
        when(petRepository.findById(10L)).thenReturn(Optional.of(dog));
        when(vetScanRecordRepository.save(any(VetScanRecord.class))).thenAnswer(i -> {
            VetScanRecord r = i.getArgument(0);
            r.setId(304L);
            return r;
        });

        VetScanResponseDTO response = vetScanService.analyzeScan(file, 10L, "{}", "owner@petverse.com");

        assertNotNull(response);
        assertEquals("INSUFFICIENT_IMAGE", response.status());
        assertTrue(response.statusMessage().contains("Non-biological graphic or document detected")
                || response.statusMessage().contains("does not appear to be a canine skin")
                || response.statusMessage().contains("dominated by blank document background"));
        assertTrue(response.predictions().isEmpty());
        assertNull(response.explanationImageReference());
    }

    @Test
    @DisplayName("VETSCAN-TEST-12: Rejects desaturated / black-and-white graphics")
    void testDesaturatedGrayscaleImageRejected() throws IOException {
        BufferedImage grayImg = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = grayImg.createGraphics();
        g.setColor(new Color(128, 128, 128)); // Neutral gray, saturation = 0
        g.fillRect(0, 0, 200, 200);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(grayImg, "jpg", baos);
        byte[] grayBytes = baos.toByteArray();

        MockMultipartFile file = new MockMultipartFile("image", "gray.jpg", "image/jpeg", grayBytes);

        when(userRepository.findByEmail("owner@petverse.com")).thenReturn(Optional.of(owner));
        when(petRepository.findById(10L)).thenReturn(Optional.of(dog));
        when(vetScanRecordRepository.save(any(VetScanRecord.class))).thenAnswer(i -> {
            VetScanRecord r = i.getArgument(0);
            r.setId(305L);
            return r;
        });

        VetScanResponseDTO response = vetScanService.analyzeScan(file, 10L, "{}", "owner@petverse.com");

        assertNotNull(response);
        assertEquals("INSUFFICIENT_IMAGE", response.status());
        assertTrue(response.statusMessage().contains("Desaturated or black-and-white graphic detected"));
    }
}
