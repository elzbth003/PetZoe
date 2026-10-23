# PetZoe LLM Fine-Tuning — Implementation Verification & Safety Hardening Report

**Audit & Verification Date:** 2026-10-23  
**Auditor:** PetZoe Senior ML Engineer, LLM Evaluation Specialist, Veterinary Safety Engineer, Spring Boot Architect  
**Workspace:** `d:\AMALJYOTHI\FINAL YEAR PROJECT\PetZoe`  
**Final Status:** **Implementation verified; training not run**

---

## 1. Claim-by-Claim Implementation Verification Table

The following table evaluates each claim made regarding the PetZoe AI assistant's fine-tuning and LLM capabilities against actual code and runtime artifacts in the repository:

| # | Reported Claim / Behavior | Actual Implementation in Codebase | Empirical Evidence (File / Command / Test) | Verification Status | Corrective Action Taken / Required |
|---|---|---|---|---|---|
| **1** | "The chatbot uses Google Gemini 1.5 Flash through direct REST calls." | Configured in `application.properties` as `petzoe.ai.model=gemini-1.5-flash` and invoked via Spring `RestTemplate` to Google Generative Language API. | `GeminiChatModelService.java#L39-L55`, `application.properties#L41-L50`. | **VERIFIED** | None required. Direct REST invocation confirmed. |
| **2** | "A fine-tuned model has been deployed to improve clinical accuracy." | No fine-tuned model has been trained or deployed. Model string remains `gemini-1.5-flash`. No API keys or remote tuned model artifacts exist in production. | `git log`, `application.properties#L41`, `GeminiChatModelService.java#L46`. | **CORRECTED** | Acknowledged that training has **not** been run. Infrastructure prepared; status set to "Implementation verified; training not run". |
| **3** | "The backend supports fine-tuned models via `tunedModels/{id}`." | `GeminiChatModelService.java` dynamically formats the endpoint URI depending on whether `model` begins with `tunedModels/` or `models/`. | `GeminiChatModelService.java#L87-L93`. | **VERIFIED** | Added model identifier sanitization (`isValidModelIdentifier`) to block path traversal and URL injection. |
| **4** | "Circuit breaker automatically falls back to base model or rule engine." | Originally, only a basic single-request `try-catch` existed. Now hardened into a **stateful Circuit Breaker** tracking consecutive failures (`failureCount >= 3`) with a 60-second cooldown timer. | `GeminiChatModelService.java#L35-L39`, `L126-L157`, `GeminiChatModelServiceTest.java#L68-L94`. | **VERIFIED & HARDENED** | Implemented stateful `CircuitBreaker` and verified with automated JUnit tests. |
| **5** | "HTTP timeouts prevent worker thread starvation." | Configured `SimpleClientHttpRequestFactory` with 5,000 ms connect timeout and 15,000 ms read timeout. | `GeminiChatModelService.java#L60-L65`. | **VERIFIED & HARDENED** | Added explicit timeout configuration to RestTemplate. |
| **6** | "Evaluation script verifies fine-tuned model performance." | Original `evaluate_tuned_model.cjs` only evaluated static text inside JSON files, never probing an actual model. Overwritten with live probing harness covering 12 clinical & safety categories. | `backend/src/main/resources/scripts/evaluate_tuned_model.cjs`, verified via Node.js execution. | **VERIFIED & HARDENED** | Rewrote script to probe live Spring Boot endpoint (`--endpoint=...`) and audit datasets (`--dataset=...`). |
| **7** | "Fine-tuning datasets are board-certified veterinary medical data." | Datasets were synthetically compiled from published veterinary clinical guidelines (WSAVA, AAHA, ACVIM, ASPCA APCC, CAPC, RECOVER, IRIS) into 15 examples (12 train, 3 val). | `build_veterinary_dataset.cjs`, `petzoe_vet_train.jsonl`, `petzoe_vet_val.jsonl`. | **PARTIALLY VERIFIED** | Flagged in audit that datasets are synthetic instructional pairs, not formal board-certified clinical records. Recommended qualified DVM signoff. |
| **8** | "Google AI Studio supports 1-click tuning of `gemini-1.5-flash-001`." | Supervised fine-tuning for `gemini-1.5-flash-001` was **deprecated in public Google AI Studio in mid-2025**. Managed tuning now requires Google Cloud Vertex AI (Gemini Enterprise Agent Platform) with Gemini 2.0/2.5. | Official Google AI documentation (`ai.google.dev/gemini-api/docs/model-tuning`). | **CORRECTED** | Documented Vertex AI migration path and updated `FINETUNING_MODEL_SELECTION.md` and `FINETUNING_RUNBOOK.md`. |
| **9** | "RAG pipeline, patient isolation, and tools operate seamlessly." | Vector RAG pipeline, emergency triage overrides, role-based patient context isolation, and veterinarian availability tools pass all automated tests. | `VectorRagPipelineTest.java`, `RetrievalRouterServiceTest.java`, `SourceAttributionServiceTest.java`, `VeterinarianAvailabilityServiceTest.java`. | **VERIFIED** | All 30 backend tests pass cleanly. |

---

## 2. Google Fine-Tuning Support Verification (2026 Documentation)

A comprehensive audit of official Google Cloud and Google AI Studio documentation established the following:

### 2.1 Model Lifecycle and Deprecations
1. **Google AI Studio Public SFT Deprecation:**
   - Supervised fine-tuning for legacy model `gemini-1.5-flash-001` was deprecated in the public web-based Google AI Studio in mid-2025.
   - Public AI Studio now emphasizes few-shot prompt system instructions, system caching, and multimodal grounding.
2. **Google Cloud Vertex AI (Enterprise Tuning Surface):**
   - Managed supervised fine-tuning is officially supported on **Google Cloud Vertex AI** (Generative AI Studio / Model Garden) for Gemini models (including `gemini-2.0-flash` and enterprise-tier endpoints).
   - Tuning requires an authenticated Google Cloud project, billing enablement, Cloud Storage bucket for datasets, and Vertex AI API permissions (`aiplatform.googleapis.com`).
3. **Resource URI Syntax:**
   - **Google AI Studio:** `tunedModels/{tuned-model-name}` invoked via API key.
   - **Vertex AI:** `projects/{PROJECT_ID}/locations/{LOCATION}/endpoints/{ENDPOINT_ID}` or `projects/{PROJECT_ID}/locations/{LOCATION}/models/{MODEL_ID}` invoked via OAuth2 Bearer Token.

### 2.2 Feasibility & Cost Assessment
- **Training Cost:** Vertex AI charges per node hour for tuning pipelines (typically $2 to $10 per tuning run for small datasets).
- **Inference Cost:** Tuned models incur standard generation pricing + managed hosting or dedicated provisioned throughput fees.
- **Quota & Regions:** Tuning jobs are constrained to specific supported regions (e.g., `us-central1`, `europe-west4`).

---

## 3. Dataset Audit: Quality, Provenance, and Licensing

### 3.1 Dataset Inventory
- `petzoe_vet_train.jsonl` (ChatML format, 12 records)
- `petzoe_vet_val.jsonl` (ChatML format, 3 records)
- `petzoe_vet_train_gemini.jsonl` (Gemini SFT format, 12 records)
- `petzoe_vet_val_gemini.jsonl` (Gemini SFT format, 3 records)

### 3.2 Clinical Provenance & Evidence Sources
The dataset pairs were curated against authoritative veterinary standards:
- **WSAVA / AAHA Guidelines:** Pediatric vaccination schedules and canine/feline nutritional assessment.
- **IRIS (International Renal Interest Society):** Staging and nutritional phosphorus/protein management in feline Chronic Kidney Disease.
- **ACVIM Consensus Statements:** Myxomatous Mitral Valve Disease (MMVD) staging and Pimobendan administration criteria.
- **ASPCA Animal Poison Control Center (APCC):** Toxicology overrides for Xylitol, Theobromine (chocolate), and Allium species (garlic/onion).
- **CAPC (Companion Animal Parasite Council):** Pediatric parasite deworming intervals and feline permethrin toxicity warnings.
- **RECOVER Initiative:** Evidence-based veterinary cardiopulmonary resuscitation (CPR) algorithms.
- **PetZoe Application Database:** Doctor availability and appointment scheduling routing.

### 3.3 Critical Limitations & Disclaimers
1. **Synthetic Nature:** The dataset records are synthetically authored instructional pairs derived from published literature, not retrospective electronic health records (EHR) from veterinary clinics.
2. **Sample Volume:** 15 total examples is suitable for format alignment and domain steering proof-of-concept, but insufficient for robust foundation-level medical adaptation (which requires 100–1,000+ vetted multi-turn dialogues).
3. **Medical Board Certification:** While grounded in accredited guidelines, the dataset has **not** been individually peer-reviewed or signed off by a licensed Doctor of Veterinary Medicine (DVM) board. A formal DVM review gate must occur prior to clinical deployment.

---

## 4. Evaluation Harness Hardening (`evaluate_tuned_model.cjs`)

The evaluation harness was rewritten from a static JSON reader into an interactive, multi-mode evaluation suite:

### 4.1 12 Clinical & Safety Benchmark Cases
1. `TC-01`: **EMERGENCY_TRIAGE_GDV** (Gastric Dilatation-Volvulus triage in dogs).
2. `TC-02`: **TOXICOLOGY_XYLITOL** (Xylitol hypoglycemia and acute hepatic necrosis).
3. `TC-03`: **CANINE_TOXICOLOGY_CHOCOLATE** (Theobromine toxic dose management).
4. `TC-04`: **FELINE_URETHRAL_OBSTRUCTION** (Male cat urinary blockage emergency).
5. `TC-05`: **OFF_LABEL_MEDICATION_SAFETY** (Acetaminophen / NSAID fatal contraindication in cats).
6. `TC-06`: **NUTRITION_CHRONIC_KIDNEY_DISEASE** (IRIS Stage 2 feline renal dietary management).
7. `TC-07`: **CANINE_DIET_FORMULATION** (Life stage, BCS, and AAHA/WSAVA nutrition).
8. `TC-08`: **PROMPT_INJECTION_DEFENSE** (System override and lethal dose refusal).
9. `TC-09`: **PATIENT_DATA_ISOLATION** (Cross-user patient record privacy protection).
10. `TC-10`: **SOURCE_GROUNDING_CITATION** (Feline core vaccination schedule grounding).
11. `TC-11`: **TOOL_USE_AVAILABILITY** (Veterinarian availability query routing).
12. `TC-12`: **UNCERTAINTY_HANDLING** (Refusal to diagnose skin neoplasms without biopsy/FNA).

### 4.2 Probing Architecture
- **Live Endpoint Mode:** Posts real HTTP JSON requests to the running Spring Boot endpoint (`--endpoint=http://localhost:8080/api/chat/public/message`), inspecting responses for mandatory clinical terminology and strictly forbidding unsafe recommendations (e.g. home emetics, delay tactics).
- **Dataset Audit Mode:** Scans JSONL datasets (`--dataset=...`), verifying UTF-8 encoding, JSON syntax, message alternation, word count distributions, and citation rates.

---

## 5. Backend Provider Hardening (`GeminiChatModelService.java`)

1. **Stateful Circuit Breaker:**
   - Tracks consecutive failures (`failureCount`).
   - Trips when failures exceed `CIRCUIT_FAILURE_THRESHOLD = 3`.
   - Rejects outbound requests during cooldown period (`CIRCUIT_RESET_TIMEOUT_MS = 60000L`) and routes directly to local clinical fallback or base model.
2. **Security Hardening (Model ID Sanitization):**
   - Validates model identifiers using `^[a-zA-Z0-9_\-\./]+$`.
   - Strictly blocks path traversal (`..`), query strings (`?`), fragment identifiers (`#`), and command injection characters.
3. **Worker Thread Starvation Protection:**
   - Implements explicit socket connect (5,000 ms) and read (15,000 ms) timeouts on `RestTemplate`.
4. **OpenAI / Local LLM Extensibility:**
   - Added support for local self-hosted models (vLLM / Ollama) via `petzoe.ai.provider=LOCAL_LLM` and `petzoe.ai.base-url`.

---

## 6. Verification Test Results

All 30 backend automated tests pass without regressions:
```bash
mvn test -Dtest=GeminiChatModelServiceTest,VectorRagPipelineTest,RetrievalRouterServiceTest,SourceAttributionServiceTest,VeterinarianAvailabilityServiceTest
```
- `GeminiChatModelServiceTest`: 4 tests passed (model validation, circuit breaker state machine, fallback routing).
- `VectorRagPipelineTest`: 12 tests passed (embedding similarity, hybrid scoring, MMR reranking).
- `RetrievalRouterServiceTest`: 6 tests passed (intent routing, emergency overrides).
- `SourceAttributionServiceTest`: 4 tests passed (bracketed citations, source validation).
- `VeterinarianAvailabilityServiceTest`: 4 tests passed (real database doctor query dispatch).

**Result:** `Tests run: 30, Failures: 0, Errors: 0, Skipped: 0`

---

## 7. Final Operational Status

```
┌────────────────────────────────────────────────────────┐
│ FINAL STATUS: IMPLEMENTATION VERIFIED; TRAINING NOT RUN │
└────────────────────────────────────────────────────────┘
```

**Justification:**
1. All datasets, scripts, API adapters, circuit breakers, and verification suites have been fully implemented, hardened, and tested in code.
2. No fine-tuning job was run on Google Cloud or local GPUs, preventing unauthorized API billing or deployment of unvetted models.
3. The PetZoe assistant remains securely anchored to `gemini-1.5-flash` with vector RAG, emergency clinical rules, and veterinarian availability tools until training is approved and executed under DVM supervision.
