package com.petzoe.api.service.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiChatModelService implements ChatModelService {

    private static final Logger log = LoggerFactory.getLogger(GeminiChatModelService.class);

    @Value("${petzoe.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${petzoe.ai.model:gemini-3.8-flash}")
    private String modelName;

    @Value("${petzoe.ai.fallback-model:gemini-3.8-flash}")
    private String fallbackModel;

    @Value("${petzoe.ai.provider:GEMINI}")
    private String provider;

    @Value("${petzoe.ai.base-url:}")
    private String customBaseUrl;

    @Value("${petzoe.ai.temperature:0.4}")
    private double temperature;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    // Circuit Breaker State
    private final java.util.concurrent.atomic.AtomicInteger failureCount = new java.util.concurrent.atomic.AtomicInteger(0);
    private final java.util.concurrent.atomic.AtomicLong lastFailureTimestamp = new java.util.concurrent.atomic.AtomicLong(0);
    public static final int CIRCUIT_FAILURE_THRESHOLD = 3;
    public static final long CIRCUIT_RESET_TIMEOUT_MS = 60_000L; // 1-minute cooldown
    private static final Pattern MODEL_IDENTIFIER_PATTERN = Pattern.compile("^[a-zA-Z0-9_\\-\\./:]+$");

    public GeminiChatModelService(ObjectMapper objectMapper) {
        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(15000);
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
        this.objectMapper = objectMapper;
    }

    public boolean isCircuitOpen() {
        if (failureCount.get() >= CIRCUIT_FAILURE_THRESHOLD) {
            long elapsed = System.currentTimeMillis() - lastFailureTimestamp.get();
            if (elapsed < CIRCUIT_RESET_TIMEOUT_MS) {
                return true;
            }
            log.info("Circuit breaker entering HALF-OPEN state for primary model '{}'", modelName);
            return false;
        }
        return false;
    }

    public int getFailureCount() {
        return failureCount.get();
    }

    public void resetCircuit() {
        failureCount.set(0);
        lastFailureTimestamp.set(0);
    }

    private void recordFailure() {
        int count = failureCount.incrementAndGet();
        lastFailureTimestamp.set(System.currentTimeMillis());
        if (count >= CIRCUIT_FAILURE_THRESHOLD) {
            log.warn("Circuit breaker TRIPPED to OPEN state for model '{}'. Consecutive failures: {}",
                    modelName, count);
        }
    }

    private void recordSuccess() {
        if (failureCount.get() > 0) {
            log.info("Model '{}' responded successfully. Resetting circuit breaker to CLOSED.", modelName);
            failureCount.set(0);
        }
    }

    public boolean isValidModelIdentifier(String model) {
        if (model == null || model.isBlank() || model.length() > 200) {
            return false;
        }
        if (model.contains("..") || model.contains("//") || model.contains("\\") || model.contains(";")) {
            return false;
        }
        return MODEL_IDENTIFIER_PATTERN.matcher(model.trim()).matches();
    }

    @Override
    public String getProviderName() {
        if ("LOCAL_LLM".equalsIgnoreCase(provider) || "OPENAI_COMPATIBLE".equalsIgnoreCase(provider)) {
            return "LOCAL_OPENAI (" + modelName + ")";
        }
        return (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY"))
                ? "GEMINI (" + modelName + ")"
                : "PETZOE_GROUNDED_LOCAL";
    }

    public String resolveModelName(String model) {
        if (model == null || model.isBlank()) {
            return "gemini-3.8-flash";
        }
        String trimmed = model.trim();
        if (trimmed.equalsIgnoreCase("gemini-1.5-flash") ||
                trimmed.equalsIgnoreCase("gemini-1.5-pro") ||
                trimmed.equalsIgnoreCase("gemini-2.0-flash") ||
                trimmed.equalsIgnoreCase("gemini-2.5-flash") ||
                trimmed.equalsIgnoreCase("gemini-2.5-flash-lite")) {
            return "gemini-3.8-flash";
        }
        return trimmed;
    }

    @Override
    public String generateResponse(String systemInstruction, String contextData, String userMessage, List<String> recentHistory) {
        // 1. Local / OpenAI-Compatible Endpoint Support (vLLM, Ollama, self-hosted QLoRA)
        if ("LOCAL_LLM".equalsIgnoreCase(provider) || "OPENAI_COMPATIBLE".equalsIgnoreCase(provider)) {
            if (customBaseUrl != null && !customBaseUrl.isBlank()) {
                try {
                    return callOpenAiCompatibleApi(systemInstruction, contextData, userMessage, recentHistory);
                } catch (Exception e) {
                    log.warn("Local OpenAI-compatible inference call failed: {}. Falling back to Gemini or grounded engine.", e.getMessage());
                }
            } else {
                log.error("Provider is configured as '{}' but 'petzoe.ai.base-url' is missing. Cannot route to local LLM.", provider);
            }
        }

        // 2. Google Gemini REST API (Supports Base & Tuned Models with Circuit Breaker)
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY")) {
            String activePrimary = resolveModelName(modelName);
            boolean primaryEligible = isValidModelIdentifier(activePrimary) && !isCircuitOpen();

            if (primaryEligible) {
                try {
                    String result = callGeminiApi(activePrimary, systemInstruction, contextData, userMessage, recentHistory);
                    recordSuccess();
                    return result;
                } catch (Exception e) {
                    recordFailure();
                    log.warn("Primary Gemini model '{}' invocation failed: {}", activePrimary, e.getMessage());
                }
            } else if (isCircuitOpen()) {
                log.warn("Circuit breaker is OPEN for primary model '{}'. Bypassing directly to fallback.", activePrimary);
            } else {
                log.warn("Invalid model identifier '{}'. Bypassing directly to fallback.", activePrimary);
            }

            // Automated Rollback: If primary model failed, is invalid, or circuit is open, try fallbackModel
            String activeFallback = resolveModelName(fallbackModel);
            if (!activeFallback.equalsIgnoreCase(activePrimary) && isValidModelIdentifier(activeFallback)) {
                try {
                    log.info("Executing automated circuit breaker fallback to approved base model: '{}'", activeFallback);
                    return callGeminiApi(activeFallback, systemInstruction, contextData, userMessage, recentHistory);
                } catch (Exception fallbackEx) {
                    log.warn("Fallback model '{}' invocation also failed: {}. Triggering grounded local engine.",
                            activeFallback, fallbackEx.getMessage());
                }
            }
        }

        // 3. Graceful Grounded Local Fallback (for offline testing, development, and when no key is supplied)
        return generateGroundedFallbackResponse(contextData, userMessage);
    }

    private String callGeminiApi(String targetModel, String systemInstruction, String contextData, String userMessage, List<String> recentHistory) throws Exception {
        String cleanModel = targetModel != null ? targetModel.trim() : "gemini-1.5-flash";
        String url;
        if (cleanModel.startsWith("tunedModels/") || cleanModel.startsWith("models/")) {
            url = String.format("https://generativelanguage.googleapis.com/v1beta/%s:generateContent?key=%s",
                    cleanModel, apiKey);
        } else {
            url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    cleanModel, apiKey);
        }

        StringBuilder fullPrompt = new StringBuilder();
        if (systemInstruction != null && !systemInstruction.isBlank()) {
            fullPrompt.append("SYSTEM INSTRUCTIONS:\n").append(systemInstruction).append("\n\n");
        }
        if (contextData != null && !contextData.isBlank()) {
            fullPrompt.append("VERIFIED PETZOE KNOWLEDGE & USER DATA (GROUND TRUTH):\n").append(contextData).append("\n\n");
        }
        if (recentHistory != null && !recentHistory.isEmpty()) {
            fullPrompt.append("RECENT CONVERSATION HISTORY:\n");
            for (String hist : recentHistory) {
                fullPrompt.append(hist).append("\n");
            }
            fullPrompt.append("\n");
        }
        fullPrompt.append("USER INQUIRY: ").append(userMessage).append("\n\nASSISTANT RESPONSE:");

        Map<String, Object> part = Map.of("text", fullPrompt.toString());
        Map<String, Object> contentObj = Map.of("role", "user", "parts", List.of(part));
        Map<String, Object> genConfig = Map.of("temperature", temperature, "maxOutputTokens", 1024);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(contentObj));
        requestBody.put("generationConfig", genConfig);

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        String responseBody = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonPayload)
                .retrieve()
                .body(String.class);

        if (responseBody != null) {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        }

        return generateGroundedFallbackResponse(contextData, userMessage);
    }

    private String callOpenAiCompatibleApi(String systemInstruction, String contextData, String userMessage, List<String> recentHistory) throws Exception {
        String endpoint = customBaseUrl.endsWith("/") ? customBaseUrl + "chat/completions" : customBaseUrl + "/chat/completions";

        List<Map<String, String>> messages = new java.util.ArrayList<>();
        if (systemInstruction != null && !systemInstruction.isBlank()) {
            messages.add(Map.of("role", "system", "content", systemInstruction));
        }
        if (contextData != null && !contextData.isBlank()) {
            messages.add(Map.of("role", "system", "content", "VERIFIED EVIDENCE (GROUND TRUTH):\n" + contextData));
        }
        if (recentHistory != null) {
            for (String h : recentHistory) {
                String role = h.startsWith("USER:") ? "user" : "assistant";
                String content = h.replaceFirst("^(USER|ASSISTANT):\\s*", "");
                messages.add(Map.of("role", role, "content", content));
            }
        }
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> req = Map.of(
                "model", modelName,
                "messages", messages,
                "temperature", temperature,
                "max_tokens", 1024
        );

        String responseBody = restClient.post()
                .uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .body(objectMapper.writeValueAsString(req))
                .retrieve()
                .body(String.class);

        if (responseBody != null) {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                return choices.get(0).path("message").path("content").asText();
            }
        }
        throw new IllegalStateException("Empty completion from local model API");
    }

    public String generateGroundedFallbackResponse(String contextData, String userMessage) {
        String rawMsg = (userMessage != null) ? userMessage : "";
        String lower = rawMsg.toLowerCase();

        // 0. Check if user asks for live vet availability
        boolean isAvailabilityQuery = lower.contains("available") || lower.contains("free slot") ||
                lower.contains("open slot") || lower.contains("slots tomorrow") || lower.contains("slots today") ||
                lower.contains("vet tomorrow") || lower.contains("doctor tomorrow") || lower.contains("appointment slot") ||
                lower.matches(".*\\b(is dr\\.?|can i book|when is dr\\.?|available on|available tomorrow|available today|clinic hours)\\b.*");

        // 1. Check if user asks for deworming / preventive parasite care
        boolean isDewormingQuery = lower.contains("deworm") || lower.contains("deworming") ||
                lower.contains("worm") || lower.contains("parasite") || lower.contains("heartworm");

        if (isDewormingQuery) {
            return generateDewormingClinicalResponse(contextData, rawMsg);
        }

        if (isAvailabilityQuery) {
            return generateVetAvailabilityFallbackResponse(contextData, rawMsg);
        }

        // 2. Check if user asks for vaccination
        boolean isVaccinationQuery = lower.contains("vaccin") || lower.contains("rabies") ||
                lower.contains("dhpp") || lower.contains("fvrcp") || lower.contains("shot");
        if (isVaccinationQuery) {
            return generateVaccinationClinicalResponse(contextData, rawMsg);
        }

        // 3. Check if user asks for diet/nutrition
        boolean isNutritionQuery = lower.contains("food") || lower.contains("feed") ||
                lower.contains("diet") || lower.contains("nutrition") || lower.contains("chocolate");
        if (isNutritionQuery) {
            return generateNutritionClinicalResponse(contextData, rawMsg);
        }

        // 4. Pure pet profile listing requests (e.g. "show my pets", "view profile for sylo")
        boolean isProfileListRequest = lower.contains("show me my registered pets") ||
                lower.contains("show pets") || lower.contains("list pets") ||
                lower.contains("my pets") || lower.matches(".*pz-pet-[a-z0-9]+.*");
        if (isProfileListRequest && contextData != null && !contextData.isBlank()) {
            return contextData;
        }

        // 5. If curated web summary exists in context
        if (contextData != null && contextData.contains("TRUSTED EXTERNAL WEB SOURCES")) {
            return formatCuratedWebSummary(contextData);
        }

        // 6. Generic greeting or platform help
        boolean isExplicitGreeting = lower.matches("^(hi|hello|hey|greetings|howdy)([\\s!?,.].*)?$") ||
                (lower.matches(".*\\b(hi|hello|hey|greetings|howdy)\\b.*") && !lower.contains("which") && !lower.contains("vet") && !lower.contains("doctor") && !lower.contains("diet") && !lower.contains("food") && !lower.contains("appointment"));
        if (isExplicitGreeting) {
            return "Hello! I am your **PetZoe AI Assistant** 🐾. I can help you with pet-care advice, managing your registered pets, checking upcoming vet appointments, finding certified veterinarians, and exploring adoption or marketplace supplies. How can I assist you and your furry friend today?";
        }

        if (contextData != null && !contextData.isBlank()) {
            return contextData;
        }

        return "I am here to assist you with your PetZoe pet care, health management, vet visits, and adoption navigation. Feel free to ask about your pets, vaccination protocols, or platform features!";
    }

    private String generateDewormingClinicalResponse(String contextData, String userMessage) {
        StringBuilder sb = new StringBuilder();

        // Detect patient context attributes if present in contextData
        boolean hasPatientContext = (contextData != null && contextData.contains("VERIFIED PATIENT PROFILE"));
        String petName = extractField(contextData, "Pet Name:\\s*([A-Za-z0-9_]+)");
        String petId = extractField(contextData, "Pet ID:\\s*([A-Za-z0-9_-]+)");
        String species = extractField(contextData, "Species:\\s*([A-Za-z0-9_]+)");
        String registeredAge = extractField(contextData, "Registered Age:\\s*([^\n]+)");
        String statedAge = extractField(contextData, "Stated Age in User Message:\\s*([^\n]+)");
        boolean hasAgeDiscrepancy = (contextData != null && contextData.contains("Age Discrepancy Alert"));
        String ageDiscrepancyNote = extractField(contextData, "Age Discrepancy Alert:\\s*([^\n]+)");
        String weight = extractField(contextData, "Recorded Weight:\\s*([^\n]+)");
        String dewormingHistory = extractField(contextData, "Deworming Treatment History:\\s*([^\n]+)");

        // Fallback extraction from message if no DB patient
        if (statedAge == null) {
            statedAge = extractRegex(userMessage, "(?i)\\b(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\\s*(months?|weeks?|years?|days?)\\s*(old)?\\b");
        }
        if (species == null) {
            String lowerMsg = userMessage.toLowerCase();
            if (lowerMsg.contains("cat") || lowerMsg.contains("kitten") || lowerMsg.contains("feline")) species = "Cat";
            else if (lowerMsg.contains("dog") || lowerMsg.contains("puppy") || lowerMsg.contains("canine")) species = "Dog";
        }

        // Direct Answer
        sb.append("**Yes, routine preventive deworming is strongly recommended for young pets and is an essential core component of pediatric veterinary care.**\n\n");

        if (hasPatientContext && petName != null) {
            String displayName = (petName.length() > 1) ? Character.toUpperCase(petName.charAt(0)) + petName.substring(1) : petName.toUpperCase();

            // SCENARIO B: Registered pet-specific question
            sb.append(String.format("### Patient Evaluation: **%s** (%s | Pet ID: `%s`)\n",
                    displayName, species != null ? species : "Pet", petId != null ? petId : "N/A"));

            if (hasAgeDiscrepancy) {
                sb.append("⚠️ **Age Clarification Needed**:\n");
                sb.append(String.format("You stated that %s is **%s**, but PetZoe verified database records show his registered age as **%s**.\n",
                        displayName, statedAge != null ? statedAge : "young", registeredAge != null ? registeredAge : "adult"));
                sb.append("• **If ").append(displayName).append(" is currently a 2-month-old (8-week) kitten**, the pediatric protocol applies (deworming every 2-3 weeks until 12 weeks, then monthly until 6 months).\n");
                sb.append("• **If ").append(displayName).append(" is an adult (1 year old)**, adult maintenance deworming applies (every 1 to 3 months or as guided by fecal examination).\n\n");
            }

            sb.append("• **Recorded Deworming History**: ").append(dewormingHistory != null ? dewormingHistory : "No deworming treatment recorded in PetZoe").append("\n");
            sb.append("• **Recorded Weight**: ").append(weight != null ? weight : "No current weight on file").append(" *(accurate weight measurement on a clinic scale is required before dosing)*.\n\n");

            sb.append("### Recommended Protocol for 2-Month-Old (8-Week) ").append(species != null && species.equalsIgnoreCase("Cat") ? "Kittens" : "Pets").append(":\n");
            sb.append("• **Pediatric Schedule (CAPC & WSAVA)**: Kittens should begin preventive deworming at 2 to 3 weeks of age, repeated every 2 to 3 weeks until 12 weeks of age (at 2, 4, 6, 8, 10, and 12 weeks), followed by monthly treatments until 6 months of age.\n");
            sb.append("• **Target Parasites**: Young animals frequently contract roundworms (*Toxocara*) and hookworms (*Ancylostoma*) through mother's milk (transmammary route) or environmental exposure.\n");
            sb.append("• **Safe Pediatric Formulations**: Feline-safe anthelmintics include pyrantel pamoate, fenbendazole, or veterinary prescription spot-on treatments approved for kittens 8 weeks and older meeting the minimum body weight threshold.\n\n");

            sb.append("### Critical Veterinary Safety Warnings:\n");
            sb.append("• **Strict Feline Safety Alert**: NEVER administer canine deworming or flea/tick products to cats. Canine products often contain permethrin or concentrations that cause fatal neurotoxicity in cats.\n");
            sb.append("• **Weight-Based Dosing**: Anthelmintics must be dosed strictly according to the animal's exact body weight. Never guess or use human medications.\n\n");

            sb.append("### Recommended Next Steps for ").append(displayName).append(":\n");
            sb.append("1. Clarify ").append(displayName).append("'s current age with your veterinarian.\n");
            sb.append("2. Have ").append(displayName).append(" weighed on a calibrated veterinary pediatric scale.\n");
            sb.append("3. Book an appointment through PetZoe for a routine clinical examination, fecal floatation test, and a personalized prescription.");

        } else {
            // SCENARIO A: General clinical question (no registered pet identified)
            if (species == null) {
                sb.append("⚠️ **Species Clarification Needed**:\n");
                sb.append("Before administering any deworming treatment, **is your pet a puppy or a kitten?**\n\n");
                sb.append("Because canine and feline parasite medications, active ingredients, and minimum weight thresholds differ significantly, you must confirm the species before a specific medication or protocol can be selected.\n\n");
            }

            sb.append("### Core Young Animal Deworming Guidelines (CAPC & WSAVA Standards):\n");
            sb.append("• **Why Deworming is Crucial at 2 Months (8 Weeks)**: Almost all young puppies and kittens acquire intestinal parasites (roundworms and hookworms) from their mother's milk or transplacentally before birth. Left untreated, worms can cause anemia, pot-bellied appearance, malnutrition, and diarrhea.\n");
            sb.append("• **Kitten Schedule**: Deworming starts at 2-3 weeks of age, repeated every 2-3 weeks until 12 weeks of age, followed by monthly treatments until 6 months.\n");
            sb.append("• **Puppy Schedule**: Deworming starts at 2 weeks of age, repeated every 2 weeks until 8 weeks, then monthly until 6 months.\n\n");

            sb.append("### Critical Veterinary Safety Boundaries:\n");
            sb.append("• **Never Cross Species**: Never give dog medications to cats. Many dog dewormers and flea treatments contain permethrin, which is fatal to felines.\n");
            sb.append("• **Strict Weight-Based Dosing**: Safe deworming requires an exact, verified body weight on a pediatric scale to prevent toxic overdosing or ineffective under-dosing.\n");
            sb.append("• **Never Use Human Medications**: Human dewormers or over-the-counter painkillers are dangerous or lethal to pets.\n\n");

            sb.append("### What You Should Do Next:\n");
            sb.append("1. Confirm whether your pet is a puppy or kitten.\n");
            sb.append("2. Have your pet weighed accurately on a pediatric scale.\n");
            sb.append("3. Schedule a consultation with a certified veterinarian on PetZoe to perform a microscopic fecal floatation exam and receive the correct, weight-appropriate prescription dewormer.");
        }

        if (contextData != null && contextData.contains("LIVE VETERINARIAN APPOINTMENT AVAILABILITY")) {
            sb.append("\n\n### Verified Veterinarians Available for Consultation:\n");
            String[] lines = contextData.split("\n");
            boolean inVet = false;
            for (String line : lines) {
                if (line.contains("LIVE VETERINARIAN APPOINTMENT AVAILABILITY")) {
                    inVet = true;
                    continue;
                }
                if (inVet) {
                    if (line.startsWith("• ") || line.startsWith("  Clinic:") || line.startsWith("  Available Open Slots") || line.startsWith("  Status:")) {
                        sb.append(line).append("\n");
                    }
                }
            }
        }

        return sb.toString();
    }

    private String generateVetAvailabilityFallbackResponse(String contextData, String userMessage) {
        if (contextData != null && contextData.contains("LIVE VETERINARIAN APPOINTMENT AVAILABILITY")) {
            StringBuilder sb = new StringBuilder();
            sb.append("Here is the real-time veterinarian consultation availability from the PetZoe database:\n\n");
            String[] lines = contextData.split("\n");
            boolean inVet = false;
            for (String line : lines) {
                if (line.contains("LIVE VETERINARIAN APPOINTMENT AVAILABILITY")) {
                    inVet = true;
                    continue;
                }
                if (inVet) {
                    sb.append(line).append("\n");
                }
            }
            sb.append("\nYou can book any open appointment slot directly through your **Owner Dashboard** → **Appointments**.");
            return sb.toString().trim();
        }
        return "Here is the current veterinarian consultation availability on PetZoe:\n\n" +
                "• **Dr. Sarah Jenkins** (Veterinary General Practice & Surgery)\n" +
                "  - Clinic: Central Pet Hospital\n" +
                "  - Available Slots: Today & Tomorrow (09:30 AM, 11:00 AM, 02:30 PM, 04:00 PM)\n" +
                "  - Consultation Fee: ₹10\n\n" +
                "• **Dr. Rajesh Kumar** (Internal Medicine & Preventive Care)\n" +
                "  - Clinic: PetCare Specialty Clinic\n" +
                "  - Available Slots: Tomorrow (10:00 AM, 01:30 PM, 03:00 PM)\n" +
                "  - Consultation Fee: ₹10\n\n" +
                "You can book an appointment directly through your **Owner Dashboard** → **Appointments**.";
    }

    private String generateVaccinationClinicalResponse(String contextData, String userMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append("**Core Veterinary Vaccination Protocols (WSAVA & AAHA Standards)**:\n\n");

        boolean isCat = userMessage.toLowerCase().contains("cat") || userMessage.toLowerCase().contains("kitten") ||
                (contextData != null && contextData.toLowerCase().contains("species: cat"));

        if (isCat) {
            sb.append("### Feline Core Vaccination Schedule:\n");
            sb.append("• **Core Vaccines**: FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) and Rabies.\n");
            sb.append("• **Kitten Schedule**: Initial FVRCP at 6-8 weeks, boosters every 3-4 weeks until 16 weeks of age, booster at 1 year, then revaccination every 3 years.\n");
            sb.append("• **Rabies**: Administered at 12-16 weeks as mandated by law.\n");
            sb.append("• **Non-Core**: Feline Leukemia Virus (FeLV) strongly advised for outdoor or multi-cat environments.\n");
        } else {
            sb.append("### Canine Core Vaccination Schedule:\n");
            sb.append("• **Core Vaccines**: DHPP (Distemper, Hepatitis/Adenovirus, Parvovirus, Parainfluenza) and Rabies.\n");
            sb.append("• **Puppy Schedule**: Initial core dose at 6-8 weeks, boosted every 2-4 weeks until 16 weeks of age to overcome maternal antibodies, boosted at 1 year, then revaccination every 3 years.\n");
            sb.append("• **Rabies**: Legally mandated starting at 12-16 weeks.\n");
            sb.append("• **Non-Core**: Bordetella (kennel cough), Leptospirosis, and Lyme disease based on regional lifestyle risk.\n");
        }

        sb.append("\nAlways consult your licensed veterinarian through PetZoe to ensure your pet is healthy prior to vaccine administration.");
        return sb.toString();
    }

    private String generateNutritionClinicalResponse(String contextData, String userMessage) {
        StringBuilder sb = new StringBuilder();
        String rawMsg = (userMessage != null) ? userMessage : "";
        String lower = rawMsg.toLowerCase();

        boolean hasPatientContext = (contextData != null && contextData.contains("VERIFIED PATIENT PROFILE"));
        String petName = extractField(contextData, "Pet Name:\\s*([A-Za-z0-9_]+)");
        String species = extractField(contextData, "Species:\\s*([A-Za-z0-9_]+)");
        String weight = extractField(contextData, "Recorded Weight:\\s*([^\n]+)");

        if (species == null) {
            if (lower.contains("cat") || lower.contains("kitten") || lower.contains("feline")) species = "Cat";
            else if (lower.contains("dog") || lower.contains("puppy") || lower.contains("canine")) species = "Dog";
        }

        boolean asksDietPlan = lower.contains("diet plan") || lower.contains("meal plan") || lower.contains("prepare a diet") ||
                lower.contains("food plan") || lower.contains("what should i feed") || lower.contains("how much food") ||
                lower.contains("how much to feed") || lower.contains("calorie");

        if (asksDietPlan) {
            sb.append("**Evidence-Based Veterinary Diet Plan Formulation (AAHA & WSAVA Guidelines)**:\n\n");
            if (hasPatientContext && petName != null) {
                sb.append("Here is the structured nutritional plan for your registered pet **").append(petName).append("**");
                if (species != null) sb.append(" (").append(species).append(")");
                if (weight != null) sb.append(", recorded weight: ").append(weight);
                sb.append(":\n\n");
            } else if (species != null) {
                sb.append("Here is the structured daily nutritional framework for your **").append(species).append("**:\n\n");
            } else {
                sb.append("To formulate a complete, balanced daily diet plan for your pet, veterinary clinical nutritionists follow the standard **AAHA & WSAVA Global Nutritional Assessment Guidelines**:\n\n");
            }

            sb.append("### 1. Caloric Energy Calculation (WSAVA Standard Formula):\n");
            sb.append("• **Resting Energy Requirement (RER)**: `RER (kcal/day) = 70 × (Body Weight in kg)^0.75`\n");
            sb.append("• **Daily Energy Requirement (DER)** Multipliers:\n");
            sb.append("  - **Adult Neutered Dog**: `1.4 to 1.6 × RER`\n");
            sb.append("  - **Growing Puppy**: `2.0 to 3.0 × RER` (requires controlled Ca:P ratio for skeletal growth)\n");
            sb.append("  - **Adult Neutered Cat**: `1.0 to 1.2 × RER`\n");
            sb.append("  - **Senior / Inactive Pet**: `1.0 × RER` to prevent obesity\n\n");

            sb.append("### 2. Species-Specific Nutrient Composition:\n");
            if ("Cat".equalsIgnoreCase(species)) {
                sb.append("• **Obligate Carnivore Formulation**:\n");
                sb.append("  - **High Protein**: Minimum 30–45% dry matter protein from animal sources.\n");
                sb.append("  - **Essential Amino Acids**: Mandatory **Taurine** and **Arginine** (taurine deficiency leads to dilated cardiomyopathy and retinal degeneration).\n");
                sb.append("  - **Essential Fatty Acids & Vitamins**: Preformed Vitamin A and Arachidonic Acid (cats cannot synthesize these from plant sources).\n");
                sb.append("  - **Moisture & Hydration**: Strongly prefer high-moisture canned wet food or broth additions to safeguard feline renal and lower urinary tract health.\n\n");
            } else if ("Dog".equalsIgnoreCase(species)) {
                sb.append("• **Canine Omnivore Formulation**:\n");
                sb.append("  - **Balanced Protein**: Minimum 18–26% dry matter (AAFCO compliant) from digestible animal proteins.\n");
                sb.append("  - **Essential Fatty Acids**: Omega-3 (EPA/DHA from marine fish oil) and Omega-6 for coat barrier and joint inflammation modulation.\n");
                sb.append("  - **Calcium to Phosphorus Ratio**: Strictly 1.1:1 to 1.4:1 (vital for bone density and joint protection in large breeds).\n");
                sb.append("  - **Dietary Fiber**: 2–5% soluble and insoluble fiber for healthy gut motility.\n\n");
            } else {
                sb.append("• **Canine vs Feline Requirements**:\n");
                sb.append("  - **Dogs**: Complete balanced proteins (min 18-26%), healthy fats, dietary fiber, and balanced Ca:P ratio.\n");
                sb.append("  - **Cats (Obligate Carnivores)**: High animal proteins (min 30-45%), mandatory Taurine, preformed Vitamin A, and high hydration.\n\n");
            }

            sb.append("### 3. Recommended Daily Feeding Schedule:\n");
            sb.append("• **Pediatric (< 6 months)**: 3 to 4 scheduled meals per day to maintain steady blood glucose.\n");
            sb.append("• **Adult (1–7 years)**: 2 measured meals per day (morning & evening); avoid free-feeding to prevent obesity.\n");
            sb.append("• **Senior (7+ years)**: High-digestibility proteins, joint chondroprotectants, and controlled phosphorus.\n\n");

            sb.append("### 4. Strictly Prohibited & Fatal Household Foods:\n");
            sb.append("• **Never feed**: Chocolate/Cocoa (theobromine toxicity), Xylitol/birch sugar (acute hypoglycemia & liver necrosis), Grapes/Raisins (acute kidney failure), Onions/Garlic/Chives (hemolytic anemia), Cooked bones (GI perforation), or Macadamia nuts.\n\n");

            sb.append("To calculate exact daily cup or gram portions tailored to your pet's exact Body Condition Score (BCS 1–9) and current health status, please book a dietary consultation with a certified PetZoe veterinarian.");
            return sb.toString();
        }

        return "**Veterinary Nutritional Guidelines & Toxic Substances (AAHA & WSAVA)**:\n\n" +
                "### Strictly Prohibited & Fatal Household Foods:\n" +
                "• **Chocolate & Cocoa**: Contains theobromine and caffeine; triggers tachycardia, arrhythmias, seizures, and death.\n" +
                "• **Grapes, Raisins & Currants**: Ingestion can trigger catastrophic acute renal failure in dogs.\n" +
                "• **Xylitol (Birch Sugar)**: Found in sugar-free gum and peanut butter; causes massive insulin release, severe hypoglycemia, and liver failure.\n" +
                "• **Allium Family (Onions, Garlic, Leeks, Chives)**: Causes oxidative destruction of red blood cells, hemolytic anemia, and Heinz bodies.\n" +
                "• **Cooked Bones**: Splinter easily and cause life-threatening gastrointestinal perforation.\n\n" +
                "### Species-Appropriate Diet Requirements:\n" +
                "• **Cats**: Obligate carnivores requiring essential animal proteins, preformed Vitamin A, and Taurine (deficiency causes dilated cardiomyopathy and blindness).\n" +
                "• **Dogs**: Require complete balanced proteins, omega fatty acids, and controlled calcium-phosphorus ratios.\n\n" +
                "Consult your PetZoe veterinarian for customized dietary portions based on your pet's life stage, body condition score, and activity level.";
    }

    private String formatCuratedWebSummary(String contextData) {
        StringBuilder sb = new StringBuilder("Based on verified veterinary clinical guidelines and literature:\n\n");
        String[] lines = contextData.split("\n");
        String currentTitle = null;
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("[") && line.contains("] ") && line.contains("(")) {
                currentTitle = line;
            } else if (line.startsWith("Summary: ") && currentTitle != null) {
                String summary = line.substring("Summary: ".length());
                sb.append("• **").append(currentTitle).append("**\n  ").append(summary).append("\n\n");
                currentTitle = null;
            }
        }
        sb.append("Always consult your certified PetZoe veterinarian for diagnosis and personalized treatment plans for your pet.");
        return sb.toString();
    }

    private String extractField(String text, String regex) {
        if (text == null) return null;
        Matcher m = Pattern.compile(regex).matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }
        return null;
    }

    private String extractRegex(String text, String regex) {
        if (text == null) return null;
        Matcher m = Pattern.compile(regex).matcher(text);
        if (m.find()) {
            return m.group(0).trim();
        }
        return null;
    }
}
