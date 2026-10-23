# PetZoe — Comprehensive LLM Integration Audit Report

**Audit Date:** 2026-10-23T12:10:00+05:30  
**Target Repository:** PetZoe Veterinary Healthcare Platform  
**Target Revision:** `5f28a5cdd4ee450761aabb9e0ef7cd50daa35a3e` (branch: `main`)  
**Auditor Roles:** Senior AI/ML Engineer, LLM Systems Architect, Spring Boot Specialist, Security Auditor  

---

## A. Executive Summary

An exhaustive, evidence-based audit was conducted on the **PetZoe AI Chatbot and LLM Integration**, inspecting the React frontend (`19.2.7`), Spring Boot backend (`Java 21`, Spring Boot `3.3.2`), and PostgreSQL database architecture.

### Key Audit Conclusions:
1. **Primary Model Provider & Invocation:**
   - **Provider:** Google Gemini API (`generativelanguage.googleapis.com/v1beta`).
   - **Model ID:** Configured as `gemini-1.5-flash` (`petzoe.ai.model`), invoked with temperature `0.4` and `maxOutputTokens: 1024`.
   - **Integration Mechanism:** Invoked via direct Spring Framework 6.1 `RestClient` HTTP calls (no Google GenAI SDK dependency in `pom.xml`).
2. **Embedding & Retrieval Architecture:**
   - **Embedding Model:** Google `text-embedding-004` ($768$-dimensional, unit-length normalized).
   - **Offline Deterministic Fallback:** `deterministic-hash-projection-768` ($768$-dimensional n-gram semantic hash projection).
   - **Vector Storage:** PostgreSQL column `real[]` on `knowledge_chunks`.
   - **Similarity Search:** Custom PL/pgSQL function `cosine_similarity_arr(a real[], b real[])` executing a sequential loop. **Note:** PetZoe is **not** currently using the native C extension `pgvector`.
   - **Hybrid RAG:** Dense vector retrieval + Exact lexical keyword search combined via **Reciprocal Rank Fusion** ($RRF_K = 60$).
3. **Clinical Boundaries & Security Isolation:**
   - Patient records and appointments are strictly isolated by authenticated Spring Security identity (`userRepository.findByEmail`).
   - Prompt injection defense, emergency short-circuiting (zero-LLM deterministic override), and untrusted data shields for external web snippets are actively implemented and verified.
4. **Overall Assessment:**
   The integration is structurally robust, defensively isolated, and grounded in verified clinical guidelines. However, **production scaling is bottlenecked by the custom PL/pgSQL vector scan**, and **Google Gemini API calls fail gracefully to a local rule engine when the API key is unpopulated**.

---

## B. Actual Architecture and Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Pet Owner (Browser)
    participant UI as PetZoeChatbot.jsx
    participant CS as chatService.js (Axios)
    participant Sec as Spring Security Filter
    participant CC as ChatController.java
    participant ACS as AiChatService.java
    participant Safe as ChatSafetyService.java
    participant Router as RetrievalRouterService.java
    participant VetLive as VeterinarianAvailabilityService.java
    participant PatCtx as PatientContextService.java
    participant HybridRAG as VectorKnowledgeRetrievalService.java
    participant DB as PostgreSQL (Knowledge & Users)
    participant Gemini as GeminiChatModelService.java
    participant GoogleAPI as Google Generative Language API
    participant Attr as SourceAttributionService.java

    User->>UI: Types query & submits
    UI->>CS: sendAuthenticatedMessage(msg, convId)
    CS->>Sec: POST /api/chat/message (Bearer JWT)
    Sec->>CC: Dispatches authenticated request
    CC->>ACS: processMessage(request, userEmail, isGuest=false)
    
    rect rgb(240, 248, 255)
        Note over ACS,Safe: Stage 1: Safety & Emergency Triage
        ACS->>Safe: isPromptInjection(message)
        ACS->>Safe: detectIntent(message)
        alt Intent == EMERGENCY
            ACS->>Safe: generateEmergencyResponse()
            ACS-->>UI: Immediate emergency override (Zero LLM latency)
        end
    end

    rect rgb(255, 250, 240)
        Note over ACS,Router: Stage 2: Retrieval Routing & Context Assembly
        ACS->>Router: createRetrievalPlan(message, intent, isAuthenticated)
        Router-->>ACS: RetrievalPlan (Mode, PetName, Sources)
        
        opt Plan has PATIENT_CONTEXT
            ACS->>PatCtx: resolvePatientContext(userEmail, petName, msg)
            PatCtx->>DB: Query user's pets & medical records (Ownership Isolated)
            PatCtx-->>ACS: Patient profile context
        end
        
        opt Plan has LIVE_VET_AVAILABILITY
            ACS->>VetLive: resolveAvailability(message)
            VetLive->>DB: Query approved doctors & slot availability
            VetLive-->>ACS: Real-time appointment slots
        end
        
        opt Plan has VECTOR_KNOWLEDGE
            ACS->>HybridRAG: search(message)
            HybridRAG->>DB: cosine_similarity_arr(embedding) + lexical search
            DB-->>HybridRAG: Ranked knowledge chunks
            HybridRAG-->>ACS: RRF fused chunks [1], [2]
        end
    end

    rect rgb(240, 255, 240)
        Note over ACS,GoogleAPI: Stage 3: LLM Inference & Post-Processing
        ACS->>Gemini: generateResponse(systemPrompt, contextData, msg, history)
        alt Live API Key Populated
            Gemini->>GoogleAPI: POST /v1beta/models/gemini-1.5-flash:generateContent
            GoogleAPI-->>Gemini: Raw LLM response string
        else API Key Absent or Exception
            Gemini-->>ACS: Grounded Rule-Engine Clinical Fallback
        end
        ACS->>Attr: validateAndFilterCitations(allCitations, generatedText)
        Attr-->>ACS: Citations labeled (CITED_IN_RESPONSE vs RETRIEVED_BACKGROUND)
    end

    ACS->>DB: Persist AiChatConversation & AiChatMessage
    ACS-->>CC: AiChatResponseDTO (with trace metadata)
    CC-->>UI: HTTP 200 OK
    UI-->>User: Renders formatted message, evidence badges & quick actions
```

---

## C. Verified Implementation Inventory

| Component | Actual Implementation | File & Method | Configuration Reference | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **LLM Provider** | Google Gemini API via `RestClient` | `GeminiChatModelService.java#L62-L108` | `petzoe.ai.provider=${AI_PROVIDER:GEMINI}` | **Verified in Code** |
| **Chatbot Model ID** | `gemini-1.5-flash` | `GeminiChatModelService.java#L26-L27` | `petzoe.ai.model=${AI_MODEL:gemini-1.5-flash}` | **Verified in Code** |
| **Embedding Model** | Google `text-embedding-004` (768-dim) | `EmbeddingService.java#L33-L34` | `petzoe.ai.embedding.model:text-embedding-004` | **Verified in Code** |
| **Offline Embedding** | Deterministic Bag-of-Words n-gram projection | `EmbeddingService.java#L153-L177` | Hardcoded `deterministic-hash-projection-768` | **Verified by Test (`VectorRagPipelineTest`)** |
| **Vector Storage** | PostgreSQL array column `embedding real[]` | `KnowledgeChunk.java#L47-L49` | Defined in entity & schema | **Verified in DB Schema** |
| **Vector Search** | Custom PL/pgSQL `cosine_similarity_arr` | `DataMigrationRunner.java#L133-L160` | Function installed on DB migration | **Verified in DB Engine** |
| **RAG Fusion** | Dense Vector + Lexical RRF ($K=60$) | `VectorKnowledgeRetrievalService.java#L115-L169` | Configured in retrieval service | **Verified by Test (`VectorRagPipelineTest`)** |
| **Doctor Availability** | Real-time database slot evaluation | `VeterinarianAvailabilityService.java#L69-L176` | Linked with `AppointmentService` | **Verified by Test (`VeterinarianAvailabilityServiceTest`)** |
| **Patient Context** | Strict ownership-isolated pet retrieval | `PatientContextService.java#L55-L140` | Bound to authenticated user | **Verified in Code** |
| **Citation Grounding** | Regex parsing `[\d+]` & candidate matching | `SourceAttributionService.java#L89-L126` | Post-generation validation | **Verified by Test (`SourceAttributionServiceTest`)** |
| **Emergency Handler** | Instant rule-based override | `ChatSafetyService.java#L110-L135` | Deterministic safety map | **Verified by Test (`RetrievalRouterServiceTest`)** |
| **Frontend Rendering** | React Chat UI with Badges & Action Chips | `PetZoeChatbot.jsx#L463-L525` | `src/components/chat/PetZoeChatbot.jsx` | **Verified by Production Vite Build** |

---

## D. Model and Embedding Inventory

| Model Identifier | Provider | Configured Property / Origin | Dimension | Invocation Location | Runtime Verified Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `gemini-1.5-flash` | Google Cloud (Gemini REST API) | `application.properties:31` (`petzoe.ai.model`) | N/A (Chat generation) | `GeminiChatModelService.java#L63` | **Configured & Implemented** *(Requires live `GEMINI_API_KEY` at runtime)* |
| `text-embedding-004` | Google Cloud (Gemini REST API) | `EmbeddingService.java#L34` (`petzoe.ai.embedding.model`) | $768$ | `EmbeddingService.java#L118` | **Configured & Implemented** *(Activated when live key present)* |
| `deterministic-hash-projection-768` | Local In-Memory Java Algorithm | `EmbeddingService.java#L28` | $768$ | `EmbeddingService.java#L153` | **Verified at Runtime** *(Used in all offline/mock test suites)* |
| `PETZOE_GROUNDED_LOCAL` | Rule-Engine Fallback Service | `GeminiChatModelService.java#L44` | N/A | `GeminiChatModelService.java#L113` | **Verified at Runtime** *(Operational without external API keys)* |

---

## E. Findings and Defects

### Finding PZ-AI-01: Vector Storage Uses PL/pgSQL Loop Over `real[]` Instead of Native `pgvector`
- **Severity:** High (Performance & Scalability)
- **File Reference:** `DataMigrationRunner.java#L133-L160` and `KnowledgeChunkRepository.java#L41`
- **Actual Behavior:** Embeddings are stored as native PostgreSQL `real[]` arrays. Similarity is computed via a PL/pgSQL function `cosine_similarity_arr(a, b)` that iterates in a loop from $1$ to $768$ on every row.
- **Expected Behavior:** High-performance vector RAG databases utilize the native C extension `pgvector` (`vector(768)`) with indexed approximate nearest neighbor search (`HNSW` or `IVFFlat`).
- **Impact:** For the current corpus of 10 documents (~40 chunks), query execution takes $<5\text{ ms}$. However, if the corpus grows to thousands of veterinary literature papers, every query will execute an $O(N \times 768)$ unindexed sequential table scan.
- **Recommended Remediation:** Migrate to the `pgvector` extension when deploying to cloud PostgreSQL instances.

### Finding PZ-AI-02: Silent Fallback to Local Rule Engine When `GEMINI_API_KEY` is Unset
- **Severity:** Medium (Observability / Operator Awareness)
- **File Reference:** `GeminiChatModelService.java#L50-L60`
- **Actual Behavior:** When `GEMINI_API_KEY` is not provided in environment variables, `GeminiChatModelService.getProviderName()` returns `"PETZOE_GROUNDED_LOCAL"`, and the application silently serves clinical rule-based answers without failing startup.
- **Recommended Remediation:** Add an active health check indicator or application startup alert logging.

### Finding PZ-AI-03: Chat Responses Use Synchronous Non-Streaming HTTP REST
- **Severity:** Low (User Experience)
- **File Reference:** `ChatController.java#L83-L90` and `PetZoeChatbot.jsx#L114`
- **Actual Behavior:** The chatbot interaction is implemented as standard synchronous HTTP POST `/api/chat/message`.
- **Recommended Remediation:** Implement a Spring `ResponseBodyEmitter` or SSE endpoint `/api/chat/stream` utilizing Gemini's streaming REST API.

---

## F. Production Verification Gaps

1. **Production Gemini API Quotas & Latencies:** Whether the deployed Google Cloud project has active pay-as-you-go billing or is subject to free-tier rate limits (15 requests/minute).
2. **Deployed Database Extension Support:** Whether the live production PostgreSQL instance has the `pgvector` extension enabled.
3. **Google Search Custom Search Engine (CX):** Whether `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_CX` are active in production.
