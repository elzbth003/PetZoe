# PETZOE UML DIAGRAMS REQUIREMENTS SPECIFICATION

This document details the extracted, verified functional and structural specifications required to model the nine (9) UML diagrams for the **PetZoe (PetVerse)** academic project submission.

---

## Diagram 1: Use Case Diagram

### Purpose
Model the external boundary of the PetZoe system, identifying human/external actors, their functional interactions, and mandatory/optional dependencies.

### Actors & Boundaries
* **System Boundary:** `Digital Pet Healthcare & Veterinary Management System (PetZoe)`
* **Primary Human Actors:**
  * `Pet Owner`: Manages companion animals, schedules clinical visits, browses adoptions, initiates rehoming, and purchases products.
  * `Veterinarian`: Manages clinic availability, conducts examinations, issues digital prescriptions, and updates electronic health records.
  * `Shelter Manager`: Handles rescue animal intakes, publishes adoption profiles, reviews applications, and coordinates handovers.
  * `Marketplace Seller`: Maintains merchandise catalog, monitors inventory, and fulfills customer orders.
  * `Administrator`: Governs user permissions, verifies professional credentials, and audits system operations.
  * `Visitor`: Unauthenticated guest exploring public listings and public AI triage.
* **External System Actors:**
  * `Razorpay Gateway`: Online financial transaction processing and signature verification.
  * `VetScan AI Service`: Microservice executing convolutional neural network inference on canine skin images.

### Use Cases & Relationships
1. **Authentication Subsystem:**
   * `Register` $\xrightarrow{\text{<<include>>}}$ `Verify Email / Phone`
   * `Login` $\xrightarrow{\text{<<include>>}}$ `Authenticate User`
2. **Pet Healthcare & EHR Subsystem:**
   * `Manage Pets` $\xrightarrow{\text{<<include>>}}$ `Add Pet`, `Update Pet`, `Delete Pet`
   * `Book Appointment` $\xrightarrow{\text{<<include>>}}$ `Select Veterinarian`, `Select Date & Time`, `Make Payment`
   * `Consultation` (Veterinarian) $\xrightarrow{\text{<<include>>}}$ `View Appointment Details`, `Update Diagnosis`, `Upload Prescription`
   * `Manage Medical Records` $\xrightarrow{\text{<<include>>}}$ `View Pet History`, `Add / Update Medical Record`
   * `Schedule Management` $\xrightarrow{\text{<<include>>}}$ `Manage Availability`, `Block / Unblock Slots`
3. **Adoption & Rehoming Subsystem:**
   * `Pet Adoption Management` $\xrightarrow{\text{<<include>>}}$ `List Pets for Adoption`, `Review Adoption Requests`, `Approve / Reject Adoption`
   * `Approve / Reject Adoption` $\xrightarrow{\text{<<extend>>}}$ `Notify Adoption Status`
   * `Manage Shelter Pets` $\xrightarrow{\text{<<include>>}}$ `Add Shelter Pet`, `Update Shelter Pet`, `Remove Shelter Pet`
4. **Marketplace Subsystem:**
   * `Manage Products` $\xrightarrow{\text{<<include>>}}$ `Add Product`, `Update Product`, `Remove Product`
   * `Manage Orders` $\xrightarrow{\text{<<include>>}}$ `View Orders`, `Update Order Status`
   * `Update Order Status` $\xrightarrow{\text{<<extend>>}}$ `Process Return / Refund`
5. **Administration Subsystem:**
   * `System Administration` $\xrightarrow{\text{<<include>>}}$ `Manage Users`, `Manage Roles & Permissions`, `System Settings`, `View Reports`, `Manage Notifications`, `Audit Logs`

---

## Diagram 2: Class Diagram

### Purpose
Represent the static structural object-oriented architecture of the PetZoe backend, capturing entities, field types, visibility, methods, and JPA cardinality.

### Primary Domain Classes & Fields
1. **`User` (Abstract Base Entity):**
   * Fields: `-id: Long`, `-email: String`, `-password: String`, `-name: String`, `-phone: String`, `-role: String`, `-enabled: boolean`, `-verificationStatus: VerificationStatus`
   * Methods: `+login()`, `+logout()`, `+updateProfile()`
2. **`Owner` (extends `User`):**
   * Fields: `-address: String`, `-city: String`, `-state: String`, `-pincode: String`
   * Methods: `+registerPet()`, `+viewAppointments()`, `+bookAppointment()`, `+makePayment()`
3. **`Veterinarian` (extends `User`):**
   * Fields: `-licenseNo: String`, `-specialization: String`, `-experience: int`, `-clinicName: String`, `-clinicAddress: String`
   * Methods: `+addPrescription()`, `+updateMedicalRecord()`, `+conductConsultation()`
4. **`ShelterManager` (extends `User`):**
   * Fields: `-shelterId: Long`, `-shelterName: String`, `-address: String`, `-phone: String`
   * Methods: `+addPetForAdoption()`, `+viewAdoptionRequests()`, `+approveAdoption()`
5. **`Administrator` (extends `User`):**
   * Fields: `-adminLevel: String`
   * Methods: `+manageUsers()`, `+verifyVeterinarian()`, `+verifyShelter()`, `+viewReports()`
6. **`Pet`:**
   * Fields: `-id: Long`, `-petCode: String`, `-name: String`, `-species: String`, `-breed: String`, `-dateOfBirth: LocalDate`, `-gender: String`, `-weight: Double`, `-microchipNumber: String`
   * Methods: `+updatePet()`, `+getPetProfile()`
7. **`Appointment`:**
   * Fields: `-id: Long`, `-appointmentDate: LocalDate`, `-appointmentTime: String`, `-status: String`, `-fee: Double`, `-paymentStatus: String`, `-razorpayOrderId: String`, `-razorpayPaymentId: String`, `-notes: String`
   * Methods: `+schedule()`, `+cancel()`, `+reschedule()`
8. **`Consultation` / `PetMedicalRecord`:**
   * Fields: `-id: Long`, `-examinationDate: LocalDate`, `-weightKg: Double`, `-healthStatus: String`, `-symptoms: String`, `-diagnosis: String`, `-treatment: String`, `-medication: String`, `-followUpRequired: Boolean`, `-followUpDate: LocalDate`
   * Methods: `+startConsultation()`, `+completeConsultation()`
9. **`Prescription`:**
   * Fields: `-id: Long`, `-medicineName: String`, `-dosage: String`, `-frequency: String`, `-duration: String`, `-instructions: String`
   * Methods: `+create()`, `+update()`
10. **`Payment`:**
    * Fields: `-id: Long`, `-razorpayOrderId: String`, `-razorpayPaymentId: String`, `-amount: BigDecimal`, `-status: PaymentStatus`, `-paymentType: PaymentType`
    * Methods: `+processPayment()`, `+refund()`
11. **`Shelter` & `Animal`:**
    * Shelter fields: `-id: Long`, `-shelterName: String`, `-address: String`, `-phone: String`, `-verified: boolean`
    * Animal fields: `-id: Long`, `-animalCode: String`, `-name: String`, `-species: String`, `-breed: String`, `-sex: AnimalSex`, `-status: AnimalStatus`, `-sterilizationStatus: SterilizationStatus`
12. **`AdoptionListing` & `AdoptionApplication`:**
    * Listing fields: `-id: Long`, `-title: String`, `-description: String`, `-status: String`
    * Application fields: `-id: Long`, `-status: AdoptionApplicationStatus`, `-housingType: HousingType`, `-hasGarden: Boolean`
    * Methods: `+submitRequest()`, `+approve()`, `+reject()`

### Associations & Multiplicities
* `Owner (1)` $\xrightarrow{\text{owns}}$ `Pet (0..*)`
* `Pet (1)` $\xrightarrow{\text{has}}$ `Appointment (0..*)`
* `Veterinarian (1)` $\xrightarrow{\text{conducts}}$ `Appointment (0..*)`
* `Appointment (1)` $\xrightarrow{\text{results in}}$ `Consultation / MedicalRecord (0..1)`
* `Consultation (1)` $\xrightarrow{\text{contains}}$ `Prescription (0..*)`
* `Shelter (1)` $\xrightarrow{\text{houses}}$ `Animal (0..*)`
* `Animal (1)` $\xrightarrow{\text{listed in}}$ `AdoptionListing (0..1)`
* `AdoptionListing (1)` $\xrightarrow{\text{receives}}$ `AdoptionApplication (0..*)`
* `Appointment (1)` $\xrightarrow{\text{settled by}}$ `Payment (0..1)`

---

## Diagram 3: Sequence Diagram

### Primary Scenario: Book Veterinary Appointment
* **Initiating Actor:** Pet Owner
* **Participants:**
  1. `Pet Owner` (Actor)
  2. `Web Application` (React Presentation Boundary)
  3. `Backend Server` (Spring Boot API Controller & Service)
  4. `Veterinarian Portal` (Doctor Client Boundary)
  5. `Database (PostgreSQL / MySQL)` (Persistence Layer)

### Complete Chronological Message Sequence
1. `1. Login`: Pet Owner submits credentials via Web Application.
2. `1.1 Authenticate`: Web Application sends POST to Backend Server.
3. `1.2 Verify Credentials`: Backend Server queries Database.
4. `1.3 User Verified`: Database confirms user role and active status.
5. `1.4 Login Success`: Backend returns signed JWT bearer token.
6. `1.5 Dashboard`: Web Application renders role-specific dashboard.
7. `2. Search Veterinarian`: Owner queries available clinicians by specialty/date.
8. `2.1 Request Veterinarian List`: Client dispatches GET `/api/appointments/availability`.
9. `2.2 Fetch Veterinarians`: Backend checks verified doctors in Database.
10. `2.3 Available Veterinarians`: Database returns matching records.
11. `2.4 Display Veterinarians`: Client displays active doctors and clinic profiles.
12. `3. Select Veterinarian & Time Slot`: Owner picks specific 30-minute slot.
13. `3.1 Check Availability`: Client validates date/time availability.
14. `3.2 Verify Slot`: Backend verifies collision query (`existsBy...`).
15. `3.3 Slot Available`: Database returns collision = false.
16. `3.4 Available Slot`: Client marks slot available for booking.
17. `4. Confirm Appointment`: Owner clicks confirm appointment.
18. `4.1 Create Appointment`: Client dispatches POST booking payload.
19. `4.2 Save Appointment (Pending)`: Backend persists entity with `status = "PENDING"`.
20. `4.3 Appointment Saved`: Database returns generated primary key.
21. `5. Send Appointment Request`: Backend emits notification to Veterinarian Portal.
22. `5.1 Accept Appointment`: Doctor reviews patient history and clicks Accept.
23. `5.2 Update Status (Accepted)`: Vet Portal posts status update (`CONFIRMED`).
24. `5.3 Update Success`: Backend persists confirmed status.
25. `5.4 Appointment Confirmed`: Backend emits real-time confirmation to Web App.
26. `5.5 Confirmation Message`: Owner receives confirmation toast and calendar event.
27. `6. Upload Prescription`: Doctor concludes consultation and uploads digital prescription.
28. `6.1 Save Prescription`: Backend validates and executes INSERT.
29. `6.2 Prescription Saved`: Database confirms prescription persistence.
30. `6.3 Update Medical Record`: Backend links diagnosis to `PetMedicalRecord`.
31. `6.4 Save Medical Record`: Record persisted with follow-up dates.
32. `6.5 Record Updated`: Database confirms commit.
33. `6.6 Consultation Completed`: Backend transitions appointment status to `COMPLETED`.
34. `6.7 View Prescription`: Web App displays e-prescription download link.
35. `7. Send Notification`: Backend dispatches consultation follow-up alert.
36. `7.1 View Appointment History`: Owner reviews longitudinal entry in health passport.

---

## Diagram 4: Activity Diagram

### Primary Workflow: End-to-End System Activity Lifecycle
* **Swimlanes (5 Columns):**
  1. `|Pet Owner|`
  2. `|System|`
  3. `|Veterinarian|`
  4. `|Shelter Manager|`
  5. `|Administrator|`

### Flow Architecture
* **Initial Node:** Pet Owner opens website $\rightarrow$ Register / Login.
* **System Activity:** Authenticate User $\rightarrow$ Load Dashboard (Role-Based).
* **Clinical Appointment Branch:**
  * Owner: Add / Manage Pet $\rightarrow$ Search Veterinarians $\rightarrow$ Select Date & Slot $\rightarrow$ Confirm Appointment.
  * System: Show Availability $\rightarrow$ Create Pending Appointment.
  * Veterinarian: Receive Request $\rightarrow$ **Decision: Accept Appointment?**
    * *No:* Reject Appointment $\rightarrow$ System updates status to `REJECTED`.
    * *Yes:* Accept Appointment $\rightarrow$ System updates status to `ACCEPTED`.
  * Owner: Make Payment $\rightarrow$ System updates payment status & confirms appointment.
  * Owner: Receive confirmation $\rightarrow$ View Appointment details.
  * Veterinarian: Provide Consultation (Online/Offline) $\rightarrow$ Update Medical Record $\rightarrow$ Upload Prescription $\rightarrow$ Update Consultation Status.
  * System: Transition appointment to `COMPLETED`.
  * Owner: Provide Rating & Review $\rightarrow$ System saves feedback.
* **Shelter & Adoption Branch:**
  * Shelter Manager: Register Shelter / Login $\rightarrow$ Update Shelter Details $\rightarrow$ Add Rescue Pets $\rightarrow$ Review Applications $\rightarrow$ **Decision: Approve Adoption?**
    * *No:* Reject Request $\rightarrow$ Notify applicant.
    * *Yes:* Approve Adoption $\rightarrow$ Update status to `ADOPTED` $\rightarrow$ Transition pet medical history to adopter.
* **Administrative Governance Branch:**
  * Administrator: Login $\rightarrow$ Verify Veterinarians (Approve/Reject) $\rightarrow$ Verify Shelters (Approve/Reject) $\rightarrow$ Manage Users & Roles $\rightarrow$ Monitor System Telemetry $\rightarrow$ Configure System Settings.
* **Final Node:** All concurrent workflows conclude at the solid terminal activity stop node.

---

## Diagram 5: Deployment Diagram

### Runtime Hardware & Execution Topology
1. **Client Devices (`<<device>>`):**
   * Modern PC / Mobile Browser (Chrome 110+, Firefox, Edge) running React 19 Single Page Application.
   * Client-side JWT session cache in browser `localStorage`.
2. **Web Server (`<<execution environment>>`):**
   * Nginx Reverse Proxy / Static Web Hosting serving pre-compiled production assets (`dist/`).
3. **Application Server (`<<server>>`):**
   * Host Server (Ubuntu Linux 22.04 LTS / Cloud VM).
   * Docker Container Runtime hosting:
     * **Spring Boot Runtime:** Java 21 JVM, embedded Apache Tomcat (Port 8080).
     * **FastAPI AI Microservice:** Python 3.11, Uvicorn server (Port 8001) executing VetScan PyTorch inference.
4. **Database Server (`<<database>>`):**
   * PostgreSQL 16 / MySQL Enterprise Database (Port 5432 / 3306) managing persistent relational schemas.
5. **External Cloud & Managed Services (`<<cloud service>>`):**
   * `Razorpay Gateway`: TLS 1.3 encrypted HTTPS API for payment processing.
   * `Google Cloud / Gemini API`: Generative AI contextual veterinary responses.
   * `Cloud Storage (AWS S3 / Firebase Storage)`: Storage for pet photos, PDF prescriptions, and clinical license attachments.
   * `Notification Service (Firebase Cloud Messaging / SMTP)`: Push notifications and email alerts.
6. **Communication Paths & Protocols:**
   * Browser to Server: `HTTPS (SSL/TLS)` on Port 443 / `WSS` WebSocket on Port 8080.
   * Backend to Database: `TCP / JDBC` (HikariCP connection pool).
   * Backend to Microservice: Internal HTTP REST on Port 8001.

---

## Diagram 6: Component Diagram

### Software Component Wiring & Interface Contracts
1. **Presentation Tier:**
   * `React Single Page Application`: Router module, UI Views, Axios REST Interceptor, and STOMP WebSocket Client.
2. **Gateway & Security Component:**
   * `Spring Security Filter Chain`: `JwtAuthenticationFilter`, `CorsFilter`, and `SecurityFilterChain`.
3. **Application Service Tier (Components with Interface Lollipops):**
   * `User Management Component`: Exposes *Authentication Service*, *Profile Management Service*, *Role & Permission Management Service*.
   * `Pet Management Component`: Exposes *Pet Profile Management Service*, *Pet Health & Breed Management Service*, *Vaccination & Reminder Service*.
   * `Appointment & Booking Component`: Exposes *Appointment Scheduling Service*, *Booking Management Service*, *Availability & Slot Management Service*, *Booking Status & Tracking Service*.
   * `Consultation Management Component`: Exposes *Teleconsultation Service*, *In-App Chat Service*, *Consultation & Session Management Service*.
   * `Medical Record Management Component`: Exposes *Medical Record Service*, *Prescription Management Service*, *Document & File Management Service*.
   * `Adoption & Shelter Management Component`: Exposes *Shelter Management Service*, *Pet Adoption Service*, *Adoption Request & Tracking Service*.
   * `Payment Management Component`: Exposes *Payment Processing Service*, *Transaction & Invoice Service*, *Refund & Payout Service*.
   * `Notification Management Component`: Exposes *Notification Orchestration Service*, *Push Notification Service*, *Alert & Reminder Service*.
   * `Reporting & Analytics Component`: Exposes *Reporting Service*, *Analytics Service*, *Dashboard & Insights Service*.
4. **Data Persistence Tier:**
   * `Data Access Layer`: Spring Data JPA Repositories wired to Relational Database schemas.
5. **External Integrations:**
   * Provided/Required bindings to Razorpay API, Google Gemini AI, and Cloud Storage.

---

## Diagram 7: State Machine Diagram

### Target Lifecycles (8 Distinct State Models)
1. **User Account State Machine:**
   * States: `Unregistered` $\rightarrow$ `Registered (Pending Verification)` $\rightarrow$ `Active (Verified)` $\rightarrow$ `Authenticated (Active Session)` $\rightarrow$ `Logged Out`.
   * Exceptions: `Rejected (Account Rejected)`, `Suspended (Inactive)`.
2. **Appointment & Booking State Machine:**
   * States: `No Appointment` $\rightarrow$ `Booking Requested (Pending)` $\rightarrow$ `Appointment Confirmed` $\rightarrow$ `Appointment Completed`.
   * Transitions: `Reject / Cancel` $\rightarrow$ `Booking Cancelled`.
3. **Consultation State Machine:**
   * States: `Scheduled` $\rightarrow$ `In Progress` $\rightarrow$ `Completed`.
   * Alternate: `In Progress` $\rightarrow$ `Cancelled`.
4. **Medical Record State Machine:**
   * States: `No Record` $\rightarrow$ `Record Created (Draft)` $\rightarrow$ `Record Updated` $\rightarrow$ `Record Saved (Final)` $\rightarrow$ `Record Archived`.
5. **Prescription State Machine:**
   * States: `No Prescription` $\rightarrow$ `Prescription Created (Draft)` $\rightarrow$ `Prescription Issued (Active)` $\rightarrow$ `Prescription Completed (Expired)`.
   * Alternate: `Prescription Created (Draft)` $\rightarrow$ `Prescription Discarded`.
6. **Payment State Machine:**
   * States: `Payment Initiated` $\rightarrow$ `Processing` $\rightarrow$ `Payment Success (Completed)`.
   * Alternate: `Processing` $\rightarrow$ `Payment Failed` $\rightarrow$ `Retry` $\rightarrow$ `Processing`.
7. **Adoption State Machine:**
   * States: `No Adoption Request` $\rightarrow$ `Request Submitted (Pending)` $\rightarrow$ `Request Under Review` $\rightarrow$ `Adoption Approved` $\rightarrow$ `Adoption Completed`.
   * Alternate: `Request Under Review` $\rightarrow$ `Request Rejected`.
8. **System Access & Role State Machine:**
   * States: `Guest Access (Limited)` $\rightarrow$ `Role-based Access` $\rightarrow$ `Active Access` $\rightarrow$ `Session Expired / Logout` $\rightarrow$ `No Access`.

---

## Diagram 8: Package Diagram

### Logical & Architectural Package Decomposition
```text
com.petzoe.api/
├── config/        # SecurityConfig, JwtService, JacksonConfig, RazorpayConfig
├── controller/    # AuthController, PetController, AppointmentController, etc.
├── dto/           # Data Transfer Objects with validation annotations
├── entity/        # JPA Entities (User, Pet, Appointment, MedicalRecord, etc.)
├── exception/     # GlobalExceptionHandler, ResourceNotFoundException
├── mapper/        # DTO-to-Entity mapping helpers
├── repository/    # Spring Data JPA Repository interfaces
├── service/       # Business logic implementations
│   ├── chat/      # AiChatService, PatientContextService, GeminiChatModelService
│   └── rag/       # VectorRetrievalService, KnowledgeBaseService
└── util/          # ValidationUtils, DateUtils
```
* **Dependency Rule:** `controller` depends on `service` and `dto`; `service` depends on `repository`, `entity`, and `dto`; `repository` depends on `entity`. No upward or cyclic dependencies.

---

## Diagram 9: Object Diagram / Collaboration Diagram

### Scenario: Runtime Instance Snapshot of Confirmed Veterinary Consultation
* **Concrete Instances & Attributed Values:**
  * `u1 : PetOwner` $\rightarrow$ `userId="U001"`, `name="Riya Sharma"`, `email="riya@gmail.com"`, `phone="9876543210"`, `address="Kochi"`.
  * `vet1 : Veterinarian` $\rightarrow$ `userId="V001"`, `name="Dr. Ankit Mehta"`, `specialization="Cardiology"`, `licenseNo="VET12345"`, `isAvailable=true`.
  * `sh1 : ShelterManager` $\rightarrow$ `shelterId="SH001"`, `name="Neha Iyer"`, `shelterName="Happy Paws Shelter"`.
  * `admin1 : Administrator` $\rightarrow$ `adminId="A001"`, `name="Admin User"`, `roleLevel="SUPER_ADMIN"`.
  * `cat1 : PetCategory` $\rightarrow$ `categoryId="CAT01"`, `name="Dog"`.
  * `pet1 : Pet` $\rightarrow$ `petId="PET001"`, `name="Bruno"`, `species="Dog"`, `breed="Golden Retriever"`, `weight=28.5`.
  * `appt1 : Appointment` $\rightarrow$ `appointmentId="APP001"`, `dateTime="2025-05-20 11:00"`, `status="CONFIRMED"`, `reason="Regular Checkup"`.
  * `cons1 : Consultation` $\rightarrow$ `consultationId="CONS001"`, `diagnosis="Healthy"`, `notes="No issues found"`.
  * `pres1 : Prescription` $\rightarrow$ `prescriptionId="PRES001"`, `medication="Multivitamin"`, `dosage="1 tablet daily"`.
  * `srv1 : Service` $\rightarrow$ `serviceId="SRV001"`, `name="General Checkup"`, `basePrice=500.00`.
  * `ps1 : ProviderService` $\rightarrow$ `providerServiceId="PS001"`, `price=500.00`, `duration=30`.
  * `pay1 : Payment` $\rightarrow$ `paymentId="PAY001"`, `amount=500.00`, `method="UPI"`, `status="PAID"`.
  * `notif1 : Notification` $\rightarrow$ `notificationId="NOT001"`, `title="Appointment Confirmed"`.
  * `rev1 : Review`, `chat1 : ChatSession`, `msg1 : Message`, `adoptReq1 : AdoptionRequest`, `adopt1 : Adoption`, `shelter1 : Shelter`.

### Numbered Collaborative Invocations (Collaboration Model)
1. `1: registerPet(petInfo)`
2. `2: bookAppointment(petId, serviceId, dateTime)`
3. `3: checkAppointment()`
4. `4: appointmentInitiated()`
5. `5: bookingConfirmed()`
6. `6: startConsultation()`
7. `7: consultationStarted()`
8. `8: consultationEnded()`
9. `9: updateMedicalRecord()`
10. `10: recordSaved()`
11. `11: manageUsers()`
12. `12: manageSystem()`
13. `13: getServiceByCategory()`
14. `14: getProviderServices()`
15. `15: serviceVerified()`
16. `16: initiatePayment(amount)`
17. `17: paymentSuccess()`
18. `18: processTransaction()`
19. `19: transactionSuccess()`
20. `20: viewAdoptionRequests()`
21. `21: requestDetails()`
22. `22: approveAdoption()`
23. `23: updateShelterPet(status)`
24. `24: shelterPetUpdated()`
25. `25: submitReview()`
26. `26: reviewSubmitted()`
27. `27: chatSessionStarted()`
28. `28: sendMessage(msg)`
