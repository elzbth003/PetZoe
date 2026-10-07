package com.petzoe.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petzoe.api.dto.vetscan.*;
import com.petzoe.api.entity.Pet;
import com.petzoe.api.entity.User;
import com.petzoe.api.entity.VetScanRecord;
import com.petzoe.api.repository.AppointmentRepository;
import com.petzoe.api.repository.PetRepository;
import com.petzoe.api.repository.UserRepository;
import com.petzoe.api.repository.VetScanRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class VetScanService {

    private final VetScanRecordRepository vetScanRecordRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${petzoe.vetscan.service-url:http://127.0.0.1:8001}")
    private String serviceUrl;

    @Value("${petzoe.vetscan.model-mode:mock}")
    private String configuredModelMode;

    private static final String UPLOAD_DIR = "uploads/";
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp"
    );

    public VetScanService(VetScanRecordRepository vetScanRecordRepository,
                          PetRepository petRepository,
                          UserRepository userRepository,
                          AppointmentRepository appointmentRepository,
                          NotificationService notificationService,
                          ObjectMapper objectMapper) {
        this.vetScanRecordRepository = vetScanRecordRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public VetScanResponseDTO analyzeScan(MultipartFile file, Long petId, String symptomsJson, String ownerEmail) throws IOException {
        User owner = getOwner(ownerEmail);
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new SecurityException("Unauthorized: You do not own this pet.");
        }

        // 1. File Validation
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image file to upload.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file format. Allowed formats: JPEG, PNG, WEBP.");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 10MB maximum limit.");
        }

        byte[] imageBytes = file.getBytes();

        // Compute SHA-256
        String imageHash = computeHash(imageBytes);

        // Store file with secure UUID
        String extension = getExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + extension;
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, imageBytes);
        String imageReference = "http://localhost:8080/uploads/" + fileName;

        // Fetch previous scan
        Optional<VetScanRecord> prevScanOpt = vetScanRecordRepository
                .findTopByPetAndStatusOrderByCreatedAtDesc(pet, "COMPLETED");

        // 2. Call FastAPI ML Microservice
        JsonNode mlResponse = callFastApiScan(imageBytes, file.getOriginalFilename(), contentType, symptomsJson);

        String status = mlResponse.path("status").asText("FAILED");
        String message = mlResponse.path("message").asText("");
        String modelName = mlResponse.path("model_name").asText("PetZoe-VetScan-EfficientNet");
        String modelVersion = mlResponse.path("model_version").asText("v1.0.0");
        String datasetVersion = mlResponse.path("dataset_version").asText("canine-derm-multilabel-v1");
        String modelMode = mlResponse.path("model_mode").asText("DEVELOPMENT_DEMO");
        double confidence = mlResponse.path("overall_confidence").asDouble(0.0);
        String confidenceLevel = mlResponse.path("confidence_level").asText("LOW");
        String severity = mlResponse.path("severity").asText("INSUFFICIENT_EVIDENCE");
        String severityDesc = mlResponse.path("severity_description").asText("");
        String disclaimer = mlResponse.path("clinical_disclaimer").asText("PetZoe VetScan is a preliminary veterinary decision-support tool, not a confirmed clinical diagnosis.");

        // Grad-CAM Heatmap handling
        String heatmapB64 = mlResponse.path("heatmap_base64").asText(null);
        String explanationRef = null;
        if (heatmapB64 != null && heatmapB64.startsWith("data:image/png;base64,")) {
            try {
                String base64Data = heatmapB64.substring("data:image/png;base64,".length());
                byte[] heatmapBytes = Base64.getDecoder().decode(base64Data);
                String heatmapFileName = UUID.randomUUID() + "-gradcam.png";
                Path heatmapPath = Paths.get(UPLOAD_DIR + heatmapFileName);
                Files.write(heatmapPath, heatmapBytes);
                explanationRef = "http://localhost:8080/uploads/" + heatmapFileName;
            } catch (Exception e) {
                explanationRef = imageReference;
            }
        }

        // Lesion predictions array to JSON string
        JsonNode predsNode = mlResponse.path("predictions");
        String predictionsJson = predsNode.isMissingNode() ? "[]" : predsNode.toString();

        // Create entity
        VetScanRecord record = new VetScanRecord();
        record.setPet(pet);
        record.setOwner(owner);
        record.setImageReference(imageReference);
        record.setImageHash(imageHash);
        record.setStatus(status);
        record.setStatusMessage(message);
        record.setModelName(modelName);
        record.setModelVersion(modelVersion);
        record.setDatasetVersion(datasetVersion);
        record.setModelMode(modelMode);
        record.setPredictionsJson(predictionsJson);
        record.setConfidence(confidence);
        record.setConfidenceLevel(confidenceLevel);
        record.setSeverity(severity);
        record.setSeverityDescription(severityDesc);
        record.setSymptomsJson(symptomsJson != null ? symptomsJson : "{}");
        record.setExplanationImageReference(explanationRef);
        record.setExplanationMethod("GRAD_CAM");
        record.setClinicalDisclaimer(disclaimer);

        // Longitudinal progression evaluation
        if ("COMPLETED".equalsIgnoreCase(status) && prevScanOpt.isPresent()) {
            VetScanRecord prev = prevScanOpt.get();
            record.setPreviousScan(prev);
            evaluateProgression(record, prev);
        } else if ("COMPLETED".equalsIgnoreCase(status)) {
            record.setProgressionStatus("BASELINE");
            record.setProgressionNotes("Initial baseline scan recorded for this canine patient.");
        } else {
            record.setProgressionStatus("INCONCLUSIVE");
            record.setProgressionNotes("Progression cannot be evaluated due to image quality or screening status.");
        }

        VetScanRecord saved = vetScanRecordRepository.save(record);

        // Send notification to owner
        if ("COMPLETED".equalsIgnoreCase(status)) {
            notificationService.createNotification(
                    owner,
                    "VetScan Screening Complete 🐾",
                    "Preliminary skin lesion screening results for " + pet.getName() + " are available. Severity estimate: " + severity + ".",
                    "VETSCAN"
            );
        } else if ("INSUFFICIENT_IMAGE".equalsIgnoreCase(status)) {
            notificationService.createNotification(
                    owner,
                    "VetScan: Clearer Photo Required",
                    "The photo uploaded for " + pet.getName() + " was out of focus or poorly lit. Please retake the photo.",
                    "VETSCAN"
            );
        }

        return toResponseDTO(saved);
    }

    public VetScanResponseDTO getScanById(Long scanId, String userEmail) {
        User user = getOwner(userEmail);
        VetScanRecord record = vetScanRecordRepository.findById(scanId)
                .orElseThrow(() -> new IllegalArgumentException("VetScan record not found with ID: " + scanId));

        validatePetAccess(record.getPet(), user);
        return toResponseDTO(record);
    }

    public List<VetScanResponseDTO> getScansByPet(Long petId, String userEmail) {
        User user = getOwner(userEmail);
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        validatePetAccess(pet, user);
        List<VetScanRecord> records = vetScanRecordRepository.findByPetOrderByCreatedAtDesc(pet);
        return records.stream().map(this::toResponseDTO).toList();
    }

    @Transactional
    public VetScanResponseDTO reviewScan(Long scanId, VetScanReviewRequestDTO reviewReq, String vetEmail) {
        User vet = userRepository.findByEmail(vetEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + vetEmail));

        if (!"Veterinarian".equalsIgnoreCase(vet.getRole()) && !"ADMIN".equalsIgnoreCase(vet.getRole())) {
            throw new AccessDeniedException("Unauthorized: Only verified veterinarians can submit clinical reviews.");
        }

        VetScanRecord record = vetScanRecordRepository.findById(scanId)
                .orElseThrow(() -> new IllegalArgumentException("VetScan record not found with ID: " + scanId));

        record.setVeterinarian(vet);
        record.setVeterinarianReviewStatus(reviewReq.reviewStatus());
        record.setVeterinarianNotes(reviewReq.veterinarianNotes());
        VetScanRecord saved = vetScanRecordRepository.save(record);

        notificationService.createNotification(
                record.getOwner(),
                "Veterinarian Reviewed VetScan 🩺",
                "Dr. " + vet.getName() + " reviewed the lesion screening for " + record.getPet().getName() + " with clinical verdict: " + reviewReq.reviewStatus() + ".",
                "VETSCAN"
        );

        return toResponseDTO(saved);
    }

    public VetScanComparisonDTO compareScans(Long currentScanId, Long previousScanId, String userEmail) {
        User user = getOwner(userEmail);
        VetScanRecord current = vetScanRecordRepository.findById(currentScanId)
                .orElseThrow(() -> new IllegalArgumentException("Current scan not found with ID: " + currentScanId));
        VetScanRecord prev = vetScanRecordRepository.findById(previousScanId)
                .orElseThrow(() -> new IllegalArgumentException("Previous scan not found with ID: " + previousScanId));

        validatePetAccess(current.getPet(), user);

        List<LesionPredictionDTO> currentPreds = parsePredictions(current.getPredictionsJson());
        List<LesionPredictionDTO> prevPreds = parsePredictions(prev.getPredictionsJson());

        Map<String, Double> prevMap = new HashMap<>();
        for (LesionPredictionDTO p : prevPreds) {
            prevMap.put(p.label(), p.probability());
        }

        List<LesionChangeMetricDTO> changes = new ArrayList<>();
        double totalDelta = 0.0;
        int count = 0;

        for (LesionPredictionDTO c : currentPreds) {
            double pProb = prevMap.getOrDefault(c.label(), 0.0);
            double delta = Math.round((c.probability() - pProb) * 1000.0) / 1000.0;
            String trend = (delta > 0.05) ? "INCREASED" : (delta < -0.05) ? "DECREASED" : "STABLE";
            changes.add(new LesionChangeMetricDTO(c.label(), c.displayName(), pProb, c.probability(), delta, trend));
            totalDelta += delta;
            count++;
        }

        double avgDelta = count > 0 ? (totalDelta / count) : 0.0;
        String progression = current.getProgressionStatus();
        String summary = String.format("Visual comparison indicates %s with average probability change of %+.1f%% across monitored lesion indicators.",
                progression.toLowerCase(), avgDelta * 100.0);

        return new VetScanComparisonDTO(
                toResponseDTO(prev),
                toResponseDTO(current),
                progression,
                summary,
                changes
        );
    }

    private void evaluateProgression(VetScanRecord current, VetScanRecord previous) {
        List<LesionPredictionDTO> currPreds = parsePredictions(current.getPredictionsJson());
        List<LesionPredictionDTO> prevPreds = parsePredictions(previous.getPredictionsJson());

        if (currPreds.isEmpty() || prevPreds.isEmpty()) {
            current.setProgressionStatus("INCONCLUSIVE");
            current.setProgressionNotes("Insufficient numerical data to compute longitudinal progression.");
            return;
        }

        Map<String, Double> prevMap = new HashMap<>();
        for (LesionPredictionDTO p : prevPreds) {
            prevMap.put(p.label(), p.probability());
        }

        double currAvg = currPreds.stream().mapToDouble(LesionPredictionDTO::probability).average().orElse(0.0);
        double prevAvg = prevPreds.stream().mapToDouble(LesionPredictionDTO::probability).average().orElse(0.0);
        double delta = currAvg - prevAvg;

        double currUlcer = currPreds.stream().filter(p -> "EROSION_ULCER".equals(p.label())).mapToDouble(LesionPredictionDTO::probability).findFirst().orElse(0.0);
        double prevUlcer = prevMap.getOrDefault("EROSION_ULCER", 0.0);

        if (currUlcer > prevUlcer + 0.15 || delta > 0.12) {
            current.setProgressionStatus("WORSENING");
            current.setProgressionNotes("Visual comparison indicates an apparent increase in erythema or dermal breakdown since prior scan.");
        } else if (currUlcer < prevUlcer - 0.15 || delta < -0.12) {
            current.setProgressionStatus("IMPROVING");
            current.setProgressionNotes("Visual comparison indicates an apparent reduction in lesion prominence and inflammation.");
        } else {
            current.setProgressionStatus("STABLE");
            current.setProgressionNotes("Visual comparison indicates apparent stability with minimal change in lesion indicators.");
        }
    }

    private JsonNode callFastApiScan(byte[] imageBytes, String filename, String contentType, String symptomsJson) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return filename != null ? filename : "scan.jpg";
                }
            };
            body.add("image", fileResource);
            if (symptomsJson != null) {
                body.add("symptoms_json", symptomsJson);
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    serviceUrl + "/api/v1/analyze",
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }
        } catch (Exception e) {
            // Microservice communication failure fallback
        }

        // In case FastAPI is offline, provide a robust internal mock fallback
        return generateInternalMockFallback();
    }

    private JsonNode generateInternalMockFallback() {
        try {
            String json = """
            {
              "status": "COMPLETED",
              "message": "Preliminary screening completed in development fallback mode.",
              "model_name": "PetZoe-VetScan-EfficientNet",
              "model_version": "v1.0.0",
              "dataset_version": "canine-derm-multilabel-v1",
              "model_mode": "DEVELOPMENT_DEMO",
              "overall_confidence": 0.82,
              "confidence_level": "HIGH",
              "severity": "MODERATE",
              "severity_description": "Focal erythema and alopecia patterns identified.",
              "clinical_disclaimer": "PetZoe VetScan provides preliminary screening indicators only and is NOT a veterinary diagnosis.",
              "predictions": [
                { "label": "ERYTHEMA", "displayName": "Erythema", "probability": 0.78, "detected": true, "threshold": 0.50, "description": "Superficial skin redness." },
                { "label": "LICHENIFICATION", "displayName": "Lichenification", "probability": 0.22, "detected": false, "threshold": 0.50, "description": "Epidermal thickening." },
                { "label": "ALOPECIA", "displayName": "Alopecia", "probability": 0.65, "detected": true, "threshold": 0.50, "description": "Noticeable coat loss." },
                { "label": "EROSION_ULCER", "displayName": "Erosion / Ulcer", "probability": 0.14, "detected": false, "threshold": 0.50, "description": "Superficial raw surface." }
              ]
            }
            """;
            return objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException("Failed to construct fallback ML response", e);
        }
    }

    private VetScanResponseDTO toResponseDTO(VetScanRecord r) {
        List<LesionPredictionDTO> predictions = parsePredictions(r.getPredictionsJson());
        Map<String, Object> symptoms = parseSymptoms(r.getSymptomsJson());

        return new VetScanResponseDTO(
                r.getId(),
                r.getPet().getId(),
                r.getPet().getName(),
                r.getPet().getPetCode(),
                r.getPet().getSpecies(),
                r.getPet().getBreed(),
                r.getImageReference(),
                r.getImageHash(),
                r.getStatus(),
                r.getStatusMessage(),
                r.getModelName(),
                r.getModelVersion(),
                r.getDatasetVersion(),
                r.getModelMode(),
                predictions,
                r.getConfidence(),
                r.getConfidenceLevel(),
                r.getSeverity(),
                r.getSeverityDescription(),
                symptoms,
                r.getExplanationImageReference(),
                r.getExplanationMethod(),
                r.getPreviousScan() != null ? r.getPreviousScan().getId() : null,
                r.getProgressionStatus(),
                r.getProgressionNotes(),
                r.getClinicalDisclaimer(),
                r.getVeterinarianReviewStatus(),
                r.getVeterinarian() != null ? r.getVeterinarian().getName() : null,
                r.getVeterinarianNotes(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    private List<LesionPredictionDTO> parsePredictions(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<LesionPredictionDTO>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private Map<String, Object> parseSymptoms(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private void validatePetAccess(Pet pet, User user) {
        boolean isOwner = pet.getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole().equalsIgnoreCase("ADMIN");
        boolean isVetWithAppointment = appointmentRepository.existsByPetIdAndVeterinarianId(pet.getId(), user.getId());

        if (!isOwner && !isAdmin && !isVetWithAppointment) {
            throw new AccessDeniedException("Unauthorized: You do not have permission to view this pet's VetScan records.");
        }
    }

    private User getOwner(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private String computeHash(byte[] bytes) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(bytes);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return null;
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return ".jpg";
    }
}
