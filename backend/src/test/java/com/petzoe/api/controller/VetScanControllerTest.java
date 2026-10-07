package com.petzoe.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petzoe.api.dto.vetscan.VetScanResponseDTO;
import com.petzoe.api.dto.vetscan.VetScanReviewRequestDTO;
import com.petzoe.api.service.VetScanService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class VetScanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VetScanService vetScanService;

    @Test
    @DisplayName("VETSCAN-CTRL-01: Unauthenticated request to /api/vetscan/analyze returns 401")
    void testUnauthenticatedAnalyzeRejected() throws Exception {
        MockMultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1, 2});

        mockMvc.perform(multipart("/api/vetscan/analyze")
                        .file(file)
                        .param("petId", "1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("VETSCAN-CTRL-02: Authenticated user can analyze pet scan")
    @WithMockUser(username = "owner@petverse.com", roles = {"USER"})
    void testAuthenticatedAnalyzeSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile("image", "lesion.jpg", "image/jpeg", new byte[]{1, 2, 3});

        VetScanResponseDTO mockResponse = new VetScanResponseDTO(
                1L, 10L, "Bruno", "PZ-PET-000001", "Dog", "Golden Retriever",
                "http://localhost:8080/uploads/lesion.jpg", "hash123", "COMPLETED",
                "Success", "PetZoe-VetScan-EfficientNet", "v1.0.0", "canine-derm-multilabel-v1",
                "DEVELOPMENT_DEMO", Collections.emptyList(), 0.85, "HIGH",
                "MILD", "Mild redness", Collections.emptyMap(), null, "GRAD_CAM",
                null, "BASELINE", "Initial baseline", "Clinical disclaimer",
                "PENDING", null, null, LocalDateTime.now(), LocalDateTime.now()
        );

        when(vetScanService.analyzeScan(any(), eq(10L), any(), eq("owner@petverse.com")))
                .thenReturn(mockResponse);

        mockMvc.perform(multipart("/api/vetscan/analyze")
                        .file(file)
                        .param("petId", "10")
                        .param("symptomsJson", "{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.petName").value("Bruno"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("VETSCAN-CTRL-03: Authenticated user can fetch scans by pet")
    @WithMockUser(username = "owner@petverse.com", roles = {"USER"})
    void testGetScansByPet() throws Exception {
        when(vetScanService.getScansByPet(eq(10L), eq("owner@petverse.com")))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/vetscan/pet/10"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("VETSCAN-CTRL-04: Veterinarian review endpoint records review")
    @WithMockUser(username = "vet@petverse.com", roles = {"VETERINARIAN"})
    void testReviewScanSuccess() throws Exception {
        VetScanReviewRequestDTO reviewReq = new VetScanReviewRequestDTO("AGREE", "Confirmed superficial lesion.");

        VetScanResponseDTO mockResponse = new VetScanResponseDTO(
                1L, 10L, "Bruno", "PZ-PET-000001", "Dog", "Golden Retriever",
                "http://localhost:8080/uploads/lesion.jpg", "hash123", "COMPLETED",
                "Success", "PetZoe-VetScan-EfficientNet", "v1.0.0", "canine-derm-multilabel-v1",
                "DEVELOPMENT_DEMO", Collections.emptyList(), 0.85, "HIGH",
                "MILD", "Mild redness", Collections.emptyMap(), null, "GRAD_CAM",
                null, "BASELINE", "Initial baseline", "Clinical disclaimer",
                "AGREE", "Dr. Smith", "Confirmed superficial lesion.", LocalDateTime.now(), LocalDateTime.now()
        );

        when(vetScanService.reviewScan(eq(1L), any(), eq("vet@petverse.com")))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/vetscan/1/veterinarian-review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.veterinarianReviewStatus").value("AGREE"))
                .andExpect(jsonPath("$.veterinarianName").value("Dr. Smith"));
    }
}
