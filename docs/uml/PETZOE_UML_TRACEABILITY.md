# PETZOE UML EVIDENCE & TRACEABILITY MATRIX

This document maps all extracted UML architectural entities, relationships, workflows, and lifecycles directly to concrete source code artifacts in the PetZoe codebase.

---

## 1. Traceability Matrix by Functional Requirement

| Requirement / UML Element | Concrete Code Implementation Path | Line / Range | Evidence Type | Confidence | Verification Status |
|---|---|---|---|---|---|
| **User Roles & Authorization (RBAC)** | `backend/src/main/java/com/petzoe/api/config/SecurityConfig.java`<br/>`backend/src/main/java/com/petzoe/api/config/JwtAuthenticationFilter.java` | L30–L95<br/>L25–L60 | Implemented | **HIGH** | Confirmed via Spring Security filter chain and JWT claims. |
| **Pet Health Passport & Longitudinal EHR** | `backend/src/main/java/com/petzoe/api/entity/Pet.java`<br/>`backend/src/main/java/com/petzoe/api/entity/PetMedicalRecord.java`<br/>`backend/src/main/java/com/petzoe/api/entity/PetVaccinationRecord.java` | L15–L85<br/>L12–L90<br/>L10–L65 | Implemented | **HIGH** | Complete JPA entities with foreign keys to Pet, Vet, and Appointment. |
| **Clinic Appointment Lifecycle & Double Booking** | `backend/src/main/java/com/petzoe/api/service/AppointmentService.java`<br/>`backend/src/main/java/com/petzoe/api/entity/Appointment.java` | L101–L380<br/>L8–L65 | Implemented | **HIGH** | Explicit collision check `existsByVeterinarianIdAndAppointmentDate...` and status guards. |
| **Consultation & Prescription Issuance** | `backend/src/main/java/com/petzoe/api/service/AppointmentService.java`<br/>`backend/src/main/java/com/petzoe/api/entity/Prescription.java` | L205–L270<br/>L10–L55 | Implemented | **HIGH** | `completeConsultation()` atomically persists diagnosis, prescriptions, and weight changes. |
| **Shelter Animal Intake & Screening** | `backend/src/main/java/com/petzoe/api/entity/Animal.java`<br/>`backend/src/main/java/com/petzoe/api/entity/AnimalIntake.java`<br/>`backend/src/main/java/com/petzoe/api/service/ShelterService.java` | L15–L75<br/>L10–L50<br/>L20–L85 | Implemented | **HIGH** | Permanent animal identity ledger separate from temporary adoption listings. |
| **Adoption Workflow & Audit Logs** | `backend/src/main/java/com/petzoe/api/entity/AdoptionApplication.java`<br/>`backend/src/main/java/com/petzoe/api/entity/AdoptionApplicationStatus.java`<br/>`backend/src/main/java/com/petzoe/api/service/AdoptionApplicationService.java` | L15–L90<br/>L3–L15<br/>L25–L110 | Implemented | **HIGH** | Full 11-state enum covering screening, home checks, review, approval, and handover. |
| **P2P Governed Pet Rehoming** | `backend/src/main/java/com/petzoe/api/controller/PetRehomeController.java`<br/>`backend/src/main/java/com/petzoe/api/service/PetRehomeService.java` | L15–L75<br/>L20–L95 | Implemented | **HIGH** | Controlled ownership transfer while preserving historical health records. |
| **Payment Gateway Integration** | `backend/src/main/java/com/petzoe/api/config/RazorpayConfig.java`<br/>`backend/src/main/java/com/petzoe/api/service/PaymentService.java`<br/>`backend/src/main/java/com/petzoe/api/entity/Payment.java` | L10–L35<br/>L40–L120<br/>L12–L65 | Implemented | **HIGH** | Razorpay SDK order generation, HMAC verification, and mock fallback support. |
| **Contextual AI Chat Assistant (RAG)** | `backend/src/main/java/com/petzoe/api/controller/ChatController.java`<br/>`backend/src/main/java/com/petzoe/api/service/chat/AiChatService.java`<br/>`backend/src/main/java/com/petzoe/api/service/chat/PatientContextService.java` | L18–L95<br/>L30–L140<br/>L25–L90 | Implemented | **HIGH** | Resolves patient context against verified database records before invoking Gemini. |
| **Canine Lesion Screening (VetScan)** | `petscan-ai-service/app/main.py`<br/>`backend/src/main/java/com/petzoe/api/service/VetScanService.java`<br/>`backend/src/main/java/com/petzoe/api/entity/VetScanRecord.java` | L1–L24<br/>L35–L110<br/>L10–L60 | Implemented | **HIGH** | FastAPI microservice on port 8001 communicating via `RestTemplate` with explainability output. |
| **Professional Credential Verification** | `backend/src/main/java/com/petzoe/api/entity/VerificationRequest.java`<br/>`backend/src/main/java/com/petzoe/api/service/VerificationService.java`<br/>`backend/src/main/java/com/petzoe/api/controller/AdminVerificationController.java` | L12–L60<br/>L20–L85<br/>L15–L70 | Implemented | **HIGH** | Admin approval gate for doctor medical licenses and shelter registration docs. |
| **Marketplace Catalog & Ordering** | `backend/src/main/java/com/petzoe/api/entity/Product.java`<br/>`backend/src/main/java/com/petzoe/api/entity/Order.java`<br/>`backend/src/main/java/com/petzoe/api/service/ProductService.java` | L15–L85<br/>L12–L75<br/>L25–L120 | Implemented | **HIGH** | Multi-category pet products, cart items, stock deduction, and tracking orders. |

---

## 2. Identified Discrepancies Between Sources

1. **Relational Database Engine (MySQL vs. PostgreSQL):**
   - *College Reference PDF:* References `Database (MySQL)` on Page 3 and Page 4.
   - *Codebase Implementation:* `pom.xml` includes `org.postgresql:postgresql` runtime dependency and `application.properties` connects to a PostgreSQL instance.
   - *Resolution:* In architectural documentation, both are ANSI SQL-compliant relational databases. PostgreSQL is the actual implementation; MySQL is cited in previous mini-project presentation drafts.
2. **Project Naming Evolution (`PetVerse` vs. `PetZoe`):**
   - *College Reference PDF:* Diagrams are titled `Digital Pet Healthcare & Veterinary Management System (PetVerse)`.
   - *Current Codebase:* Package root is `com.petzoe.api` and UI brand is `PetZoe`.
   - *Resolution:* `PetZoe` is the active final-year project name; `PetVerse` was the earlier mini-project phase working title. Both refer to the identical system architecture.
3. **Application Server Architecture:**
   - *Reference PDF Deployment Diagram:* Depicts `Node.js / Express` in earlier concept diagrams.
   - *Codebase Implementation:* `backend/pom.xml` establishes `Java 21` and `Spring Boot 3.3.2` with embedded Apache Tomcat.
   - *Resolution:* Spring Boot / Java 21 is the true implementation.
