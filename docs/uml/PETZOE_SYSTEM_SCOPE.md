# PETZOE SYSTEM SCOPE & ARCHITECTURAL BASELINE

**Project Title:** PetZoe – Digital Pet Healthcare, Veterinary Management, Adoption, and Pet Marketplace System  
**Academic Affiliation:** Department of Computer Applications, Amal Jyothi College of Engineering Autonomous, Kanjirappally  
**Scope Classification:** Production Full-Stack Application (Implemented Codebase + Proposed AI Ecosystem)

---

## 1. System Overview & Purpose
PetZoe is a centralized, multi-tenant digital pet healthcare, clinical veterinary management, ethical pet adoption/rehoming, and pet commerce ecosystem. The platform addresses the historical fragmentation of companion animal welfare—where pet medical histories, immunization tracking, clinical appointments, adoption screenings, and pet supplies exist across isolated paper records and ad-hoc communication channels. 

PetZoe unifies five primary human stakeholders (**Pet Owners, Veterinarians, Shelter Managers, Marketplace Sellers, and Administrators**) and two external computational systems (**Payment Gateway** and **AI Microservices**) into a unified web-based operating platform.

---

## 2. Stakeholders & User Roles

| Role Identifier | Human Actor | Primary Responsibilities in System | Primary Frontend Portal |
|---|---|---|---|
| `ROLE_PET_OWNER` / `Pet Owner` | Companion animal owner / adopter | Multi-pet profile management, longitudinal EHR tracking, appointment booking, e-prescription access, adoption applications, peer rehoming, product purchasing, AI chat assistant queries. | `OwnerDashboard.jsx`, `PetList.jsx`, `CartPage.jsx` |
| `ROLE_VETERINARIAN` / `Veterinarian` | Licensed veterinary clinical practitioner | Clinic schedule & time slot management, consultation queue handling, physical/teleconsultation examination, structured diagnosis & e-prescription issuance, patient history inspection. | `VetDashboard.jsx`, `VetAppointmentsPanel.jsx`, `ConsultationModal.jsx` |
| `ROLE_SHELTER_MANAGER` / `Shelter Manager` | Animal rescue & shelter organization | Shelter profile governance, rescue animal intake registration, health status assessment, adoption listing publication, applicant screening & custody handover. | `ShelterDashboard.jsx`, `ShelterAnimalsPanel.jsx`, `ShelterApplicationsPanel.jsx` |
| `ROLE_SELLER` / `Marketplace Seller` | Pet supply & pharmaceutical vendor | Store profile management, product catalog administration (pricing, categories, stock, variants), order fulfillment and shipment tracking. | `SellerDashboard.jsx`, `VendorProductDashboard.jsx`, `AddProductWizard.jsx` |
| `ROLE_ADMIN` / `Administrator` | System governance & compliance officer | Verification and approval of veterinary licenses and shelter registration certificates, product moderation, dispute handling, audit logs, system telemetry. | `AdminDashboard.jsx`, `UserManagement.jsx`, `VerificationQueue.jsx` |
| `VISITOR` / `Guest` | Unauthenticated public visitor | Public landing exploration, veterinary discovery, public adoption directory browsing, marketplace catalog browsing, general AI pet triage chatbot. | `LandingPage.jsx`, `LoginPage.jsx`, `RegisterPage.jsx` |

---

## 3. Implemented vs. Planned Functional Modules

### A. Implemented Modules (Verified via Source Code)
1. **Identity, Authentication & RBAC (`/api/auth/*`):**
   - Stateless authentication via Spring Security 6 and JSON Web Tokens (JJWT 0.11.5).
   - Google OAuth2 token verification via Google API Client.
   - Granular role-based route guards in both backend (`@PreAuthorize`) and frontend (`ProtectedRoute.jsx`).
2. **Pet Profile & Digital Health Records (`/api/pets/*`):**
   - CRUD management of multi-pet profiles with species, breed, microchip number, date of birth, and weight.
   - Longitudinal medical records (`PetMedicalRecord`) linked to consultations, symptoms, diagnosis, and follow-up schedules.
   - Vaccination ledger (`PetVaccinationRecord`) tracking administered lots and automated next-due dates.
3. **Veterinary Clinic & Appointment Scheduling Engine (`/api/appointments/*`):**
   - Dynamic doctor availability resolution based on working days, clinic operating hours, and standard 30-minute consultation slots.
   - Conflict detection preventing double-booking (`existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusIn`).
   - Multi-step status lifecycle: `PENDING_PAYMENT`, `PENDING`, `CONFIRMED`, `IN_CONSULTATION`, `COMPLETED`, `REJECTED`, `CANCELLED`.
4. **Digital Clinical Prescriptions (`/api/prescriptions/*`):**
   - Structured prescription generation specifying medication name, dosage, frequency, duration, and doctor instructions.
5. **Shelter Intake & Adoption Workflow (`/api/shelters/*`, `/api/adoptions/*`, `/api/animals/*`):**
   - Permanent animal intake ledger (`AnimalIntake`, `Animal`) separating shelter-observed traits from vet-certified records.
   - Full adoption application state machine: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `ADDITIONAL_INFORMATION_REQUIRED`, `HOUSE_CHECK_PENDING`, `HOUSE_CHECK_COMPLETED`, `APPROVED`, `REJECTED`, `WITHDRAWN`, `COMPLETED`.
   - Immutable audit logging (`AdoptionAuditLog`).
6. **Peer-to-Peer Pet Rehoming (`/api/rehome/*`):**
   - Governed rehoming requests enabling legal custody handover while preserving the animal’s prior medical and vaccination history.
7. **E-Commerce Pet Marketplace & Inventory (`/api/products/*`, `/api/cart/*`, `/api/orders/*`):**
   - Multi-category product management (Food, Health, Grooming, Accessories, Toys) with dynamic variant schemas.
   - Cart, wishlist, and transactional checkout generating order tracking references.
8. **Payment Gateway Integration (`/api/payments/*`):**
   - Server-side Razorpay order creation and HMAC-SHA256 cryptographic payment signature verification.
   - Dual-mode architecture supporting live Razorpay credentials and simulated mock fallback (`order_mock_*`).
9. **Real-Time Communication & Notifications (`/api/chat/*`, `/api/notifications/*`):**
   - Doctor-patient consultation messaging and platform-wide event notifications (`APPOINTMENT`, `ADOPTION`, `MARKETPLACE`).
10. **Explainable AI Assistant & RAG Pipeline (`/api/chat/*`):**
    - Google Gemini 1.5 Flash API integration for contextual animal healthcare questions.
    - Grounded pet context retrieval via `PatientContextService` matching verified owner database records.
11. **VetScan Canine Lesion Screening Microservice (`petscan-ai-service/`):**
    - Python FastAPI microservice (Port 8001) providing preliminary dermatological lesion classification with explainability outputs.
12. **Administrative Oversight & Governance (`/api/admin/*`):**
    - Verification queues for veterinarian clinical credentials (`VerificationRequest`, `VerificationDocument`) and shelter registration certificates.

### B. Planned / Future Scope (Design Extensions)
- Deep-learning veterinary radiological X-ray analysis.
- Multi-language regional localization (Malayalam, Hindi, Tamil).
- Native Bluetooth Low Energy (BLE) smart pet collar sync.
- Automated veterinary POS hardware counter integration.

---

## 4. Technology Stack Matrix

```text
[ Presentation Tier ]
React 19 | Vite 8 | Tailwind CSS 4 | React Router 7 | Axios | Recharts | Lucide React | Framer Motion

[ Gateway & Application Tier ]
Java 21 | Spring Boot 3.3.2 | Spring MVC | Spring Security 6 | JJWT 0.11.5 | Spring Data JPA / Hibernate 6

[ AI Microservice Tier ]
Python 3.11 | FastAPI | Uvicorn | PyTorch | Torchvision (Port 8001)

[ Persistence & Cloud Infrastructure ]
PostgreSQL 16 (Relational DB) | Firebase Cloud Storage (Media) | Razorpay Gateway (TLS 1.3) | Google Gemini API
```

---

## 5. Core Business Rules & Architectural Constraints

1. **Medical Record Immutability:** Once a consultation is transitioned to `COMPLETED`, diagnostic notes and issued prescriptions cannot be deleted; revisions require a new clinical record entry.
2. **Rehoming Medical Continuity:** When custody is transferred via `PetRehomeService` or `AdoptionApplicationService`, historical vaccination and clinical records remain linked to the animal’s permanent identity and are transitioned to the new owner’s dashboard.
3. **Veterinarian Verification Gate:** A veterinarian cannot appear in public appointment discovery or accept bookings until their account status is explicitly set to `APPROVED` by an Administrator following medical license verification.
4. **Adoption Application Exclusivity:** An animal with an active application in `APPROVED` or `COMPLETED` state is locked from further adoption applications.
5. **Double-Booking Prevention:** A veterinarian cannot have two appointments sharing the same date and 30-minute time slot unless the status of the existing booking is `CANCELLED` or `REJECTED`.
