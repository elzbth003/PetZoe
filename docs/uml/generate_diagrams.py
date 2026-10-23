import os
import subprocess
from pathlib import Path

SOURCE_DIR = Path(r"d:\AMALJYOTHI\FINAL YEAR PROJECT\PetZoe\docs\uml\source")
PNG_DIR = Path(r"d:\AMALJYOTHI\FINAL YEAR PROJECT\PetZoe\docs\uml\png")
PLANTUML_JAR = Path(r"D:\AMALJYOTHI\final project docs\Diagrams\plantuml.jar")

SOURCE_DIR.mkdir(parents=True, exist_ok=True)
PNG_DIR.mkdir(parents=True, exist_ok=True)

# -------------------------------------------------------------
# 01-use-case.puml
# -------------------------------------------------------------
USE_CASE_PUML = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundColor #FFFFFF
skinparam dpi 300
skinparam defaultFontName "Helvetica"
skinparam defaultFontSize 11
skinparam packageStyle rectangle
skinparam roundCorner 4
skinparam ArrowColor #000000
skinparam ActorBorderColor #000000
skinparam UsecaseBorderColor #000000

left to right direction

actor "Public Visitor" as Visitor
actor "Pet Owner" as Owner
actor "Veterinarian" as Vet
actor "Shelter Manager" as Shelter
actor "Marketplace Seller" as Seller
actor "Administrator" as Admin

actor "Razorpay Gateway" as Razorpay <<External System>>
actor "VetScan AI Service" as VetScan <<External System>>

rectangle "PetZoe Platform" {

    package "Identity & Profile" {
        usecase "Register & Login" as UC_Auth
        usecase "Manage User Profile" as UC_Profile
        usecase "Verify Professional Credentials" as UC_Verify
    }

    package "Pet Healthcare & EHR" {
        usecase "Manage Pet Profiles" as UC_PetProfile
        usecase "Maintain Medical & Vaccine Records" as UC_EHR
        usecase "Book Consultation Appointment" as UC_BookAppt
        usecase "Manage Appointment Schedule" as UC_ManageAppt
        usecase "Issue Digital Prescriptions" as UC_Rx
        usecase "Perform Canine Lesion Scan" as UC_LesionScan
    }

    package "Adoption & Rehoming" {
        usecase "Browse Adoptable Animals" as UC_BrowseAdoption
        usecase "Submit Adoption Application" as UC_SubmitAdoption
        usecase "Manage Shelter Animal Ingestion" as UC_ShelterAnimals
        usecase "Review & Screen Applications" as UC_ScreenAdoption
        usecase "Initiate Pet Rehoming Request" as UC_Rehome
    }

    package "Pet Marketplace" {
        usecase "Browse Products & Manage Cart" as UC_Shop
        usecase "Checkout & Process Payment" as UC_Checkout
        usecase "Manage Product Catalog & Stock" as UC_VendorProducts
        usecase "Fulfill Customer Orders" as UC_FulfillOrders
    }

    package "Communication & Governance" {
        usecase "Real-Time Consultation Chat" as UC_Chat
        usecase "Query AI Care Assistant" as UC_AiChat
        usecase "System Telemetry & Audit Logs" as UC_AdminGovernance
    }
}

' Visitor interactions
Visitor --> UC_Auth
Visitor --> UC_BrowseAdoption
Visitor --> UC_Shop
Visitor --> UC_AiChat

' Pet Owner interactions
Owner --> UC_Auth
Owner --> UC_Profile
Owner --> UC_PetProfile
Owner --> UC_EHR
Owner --> UC_BookAppt
Owner --> UC_SubmitAdoption
Owner --> UC_Rehome
Owner --> UC_Shop
Owner --> UC_Checkout
Owner --> UC_Chat
Owner --> UC_AiChat
Owner --> UC_LesionScan

' Veterinarian interactions
Vet --> UC_Auth
Vet --> UC_Profile
Vet --> UC_ManageAppt
Vet --> UC_EHR
Vet --> UC_Rx
Vet --> UC_Chat

' Shelter Manager interactions
Shelter --> UC_Auth
Shelter --> UC_Profile
Shelter --> UC_ShelterAnimals
Shelter --> UC_ScreenAdoption

' Marketplace Seller interactions
Seller --> UC_Auth
Seller --> UC_Profile
Seller --> UC_VendorProducts
Seller --> UC_FulfillOrders

' Administrator interactions
Admin --> UC_Auth
Admin --> UC_Verify
Admin --> UC_AdminGovernance

' External relationships
UC_Checkout --> Razorpay : <<interact>>
UC_BookAppt ..> UC_Checkout : <<include>>
UC_LesionScan --> VetScan : <<invoke>>
UC_Rx ..> UC_EHR : <<include>>
UC_SubmitAdoption ..> UC_BrowseAdoption : <<include>>
UC_Rehome ..> UC_EHR : <<preserve records>>

@enduml
"""

# -------------------------------------------------------------
# 02-sequence.puml
# -------------------------------------------------------------
SEQUENCE_PUML = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundColor #FFFFFF
skinparam dpi 300
skinparam defaultFontName "Helvetica"
skinparam defaultFontSize 11
skinparam roundCorner 4
skinparam ArrowColor #000000
skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceGroupBorderColor #000000

autonumber

actor "Pet Owner" as Owner
boundary "React Frontend" as UI
control "JwtAuthenticationFilter" as AuthFilter
control "AppointmentController" as Controller
participant "AppointmentService" as Service
database "AppointmentRepository" as ApptRepo
database "PaymentRepository" as PayRepo
participant "RazorpayClient" as Razorpay
participant "NotificationService" as Notify
database "PostgreSQL" as DB
actor "Veterinarian" as Vet

== 1. Slot Availability Query ==
Owner -> UI : Select Veterinarian & Consultation Date
activate UI
UI -> AuthFilter : GET /api/appointments/availability?veterinarianId=3&date=2026-10-25
activate AuthFilter
AuthFilter -> Controller : Forward Request (Authenticated)
activate Controller
Controller -> Service : getDoctorSlotAvailability(3, 2026-10-25)
activate Service
Service -> ApptRepo : findExistingBookings(3, 2026-10-25)
activate ApptRepo
ApptRepo -> DB : SELECT * FROM appointments WHERE vet_id=3 AND date=...
DB --> ApptRepo : List<Appointment>
deactivate ApptRepo
Service --> Controller : DoctorDayScheduleDTO (Available & Booked Slots)
deactivate Service
Controller --> UI : 200 OK (Slots JSON)
deactivate Controller
deactivate AuthFilter
UI --> Owner : Display Time Slots (e.g., 10:30 AM Available)
deactivate UI

== 2. Appointment Booking & Payment Initiation ==
Owner -> UI : Click "Book Slot" (Pet ID: 5, Slot: "10:30 AM")
activate UI
UI -> Controller : POST /api/appointments/initiate-payment (AppointmentDTO)
activate Controller
Controller -> Service : initiateAppointmentPayment(dto, ownerEmail)
activate Service

Service -> ApptRepo : existsByVeterinarianIdAndAppointmentDateAndAppointmentTimeAndStatusIn(...)
activate ApptRepo
ApptRepo -> DB : Collision Check (PENDING, CONFIRMED, UPCOMING)
DB --> ApptRepo : false (No collision)
deactivate ApptRepo

alt #White Slot is already booked (Collision detected)
    Service --> Controller : throw IllegalStateException("Slot already booked")
    Controller --> UI : 409 Conflict
    UI --> Owner : Display Error "Slot Taken, Please choose another"
else #White Slot is available
    Service -> DB : INSERT INTO appointments (status="PENDING_PAYMENT", fee=500.00)
    Service -> Razorpay : orders.create(amount=50000, currency="INR")
    activate Razorpay
    Razorpay --> Service : Order(id="order_NJ410294")
    deactivate Razorpay
    Service -> PayRepo : save(Payment: status=CREATED, orderId="order_NJ410294")
    Service --> Controller : AppointmentPaymentInitDTO(orderId, keyId, amount)
    deactivate Service
    Controller --> UI : 200 OK (PaymentInitDTO)
    deactivate Controller

    UI -> Owner : Launch Razorpay Checkout Modal
    Owner -> UI : Complete Payment via UPI / Card
    UI -> Controller : POST /api/appointments/verify-payment (orderId, paymentId, signature)
    activate Controller
    Controller -> Service : verifyAppointmentPayment(verifyDTO, ownerEmail)
    activate Service

    Service -> Service : verifySignature(orderId, paymentId, secret)
    Service -> PayRepo : updateStatus(paymentId, status=PAID)
    Service -> ApptRepo : updateAppointmentStatus(apptId, status="CONFIRMED")
    
    Service -> Notify : createNotification(Owner, "Appointment Confirmed", "APPOINTMENT")
    Service -> Notify : createNotification(Vet, "New Confirmed Appointment", "APPOINTMENT")
    
    Service --> Controller : AppointmentDTO (status="CONFIRMED")
    deactivate Service
    Controller --> UI : 200 OK (Confirmed Appointment)
    deactivate Controller
    UI --> Owner : Display Booking Confirmation & Receipt
    deactivate UI
end
@enduml
"""

# -------------------------------------------------------------
# 03-state-machine.puml
# -------------------------------------------------------------
STATE_MACHINE_PUML = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundColor #FFFFFF
skinparam dpi 300
skinparam defaultFontName "Helvetica"
skinparam defaultFontSize 11
skinparam roundCorner 4
skinparam ArrowColor #000000
skinparam StateBorderColor #000000

[*] --> PENDING_PAYMENT : initiateAppointmentPayment() / create Razorpay order

state PENDING_PAYMENT {
    PENDING_PAYMENT : Payment record created with status CREATED
    PENDING_PAYMENT : Slot reserved temporarily
}

PENDING_PAYMENT --> CONFIRMED : verifyAppointmentPayment()\\n[Razorpay signature valid] / mark PAID
PENDING_PAYMENT --> CANCELLED : paymentTimeout() or aborted / release slot

state PENDING {
    PENDING : Direct consultation requested without immediate gateway payment
    PENDING : Waiting for veterinarian confirmation
}

[*] --> PENDING : bookAppointment() [direct clinic booking]

PENDING --> CONFIRMED : acceptAppointment() [by Veterinarian]\\n/ notify Pet Owner
PENDING --> REJECTED : rejectAppointment(reason) [by Veterinarian]\\n/ notify Pet Owner
PENDING --> CANCELLED : cancelAppointment() [by Pet Owner or Admin]\\n/ notify Veterinarian

state CONFIRMED {
    CONFIRMED : Appointment locked in doctor schedule
    CONFIRMED : Notifications dispatched to both parties
}

CONFIRMED --> CONFIRMED : rescheduleAppointment(newDate, newTime)\\n[valid slot & within working hours]
CONFIRMED --> CANCELLED : cancelAppointment()\\n[status in PENDING, CONFIRMED, UPCOMING] / notify other party

CONFIRMED --> IN_CONSULTATION : startConsultation() [by assigned Veterinarian]

state IN_CONSULTATION {
    IN_CONSULTATION : Doctor conducts clinical examination
    IN_CONSULTATION : Consultation chat and medical notes active
}

IN_CONSULTATION --> COMPLETED : completeConsultation(submissionDTO)\\n/ persist PetMedicalRecord & Prescriptions
IN_CONSULTATION --> CANCELLED : emergencyTermination() [by Doctor]

state COMPLETED {
    COMPLETED : Immutable clinical outcome record generated
    COMPLETED : Electronic prescription available to Owner
}

state REJECTED {
    REJECTED : Rejection reason appended to appointment notes
}

state CANCELLED {
    CANCELLED : Terminal cancelled state; slots released
}

REJECTED --> [*]
CANCELLED --> [*]
COMPLETED --> [*]

@enduml
"""

# -------------------------------------------------------------
# 04-activity.puml
# -------------------------------------------------------------
ACTIVITY_PUML = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundColor #FFFFFF
skinparam dpi 300
skinparam defaultFontName "Helvetica"
skinparam defaultFontSize 11
skinparam roundCorner 4
skinparam ArrowColor #000000
skinparam ActivityBorderColor #000000

|Shelter Manager|
start
:Register Animal Intake in Shelter;
:Record Clinical Status & Vaccination State;
:Create Adoption Listing (Photos, Breed, Traits);

|PetZoe Platform (System)|
:Validate Shelter Account Verification (APPROVED);
:Publish Animal to Public Adoption Directory;

|Pet Owner (Adopter)|
:Browse Public Adoption Directory;
:Select Animal Profile & Review Medical History;
:Complete Adopter Profile (Housing, Experience);
:Submit Adoption Application (Status: SUBMITTED);

|PetZoe Platform (System)|
:Log Audit Entry (AdoptionAuditLog);
:Send Notification to Shelter Manager;

|Shelter Manager|
:Review Adoption Application;
:Transition Status to UNDER_REVIEW;

if (Is Application Complete?) then (No)
    :Request Supplementary Details;
    |PetZoe Platform (System)|
    :Update Status: ADDITIONAL_INFO_REQUIRED;
    |Pet Owner (Adopter)|
    :Update Missing Details & Resubmit;
    |Shelter Manager|
endif

if (Require Home Check?) then (Yes)
    |PetZoe Platform (System)|
    :Update Status: HOUSE_CHECK_PENDING;
    |Shelter Manager|
    :Conduct Physical / Virtual Home Visit;
    |PetZoe Platform (System)|
    :Update Status: HOUSE_CHECK_COMPLETED;
    |Shelter Manager|
else (No)
endif

if (Approve Adoption Application?) then (Yes)
    :Mark Application as APPROVED;
    |PetZoe Platform (System)|
    :Update Application Status: APPROVED;
    :Notify Adopter of Approval;
    |Shelter Manager|
    :Coordinate Physical Animal Handover;
    :Mark Application as COMPLETED;
    |PetZoe Platform (System)|
    :Update Animal Status to ADOPTED;
    :Archive Listing from Public Catalog;
    :Transfer Animal EHR History to Adopter;
    |Pet Owner (Adopter)|
    :Receive Pet Digital Health Passport;
    stop
else (No)
    |Shelter Manager|
    :Provide Rejection Reason;
    |PetZoe Platform (System)|
    :Update Application Status: REJECTED;
    :Notify Adopter with Justification;
    |Pet Owner (Adopter)|
    :View Rejection Notification;
    stop
endif

@enduml
"""

# -------------------------------------------------------------
# 05-class.puml
# -------------------------------------------------------------
CLASS_PUML = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundColor #FFFFFF
skinparam dpi 300
skinparam defaultFontName "Helvetica"
skinparam defaultFontSize 10
skinparam roundCorner 4
skinparam classAttributeIconSize 0
skinparam ArrowColor #000000
skinparam ClassBorderColor #000000

class User {
    -id: Long
    -email: String
    -password: String
    -name: String
    -phone: String
    -role: String
    -enabled: boolean
    -verificationStatus: VerificationStatus
    +getRole(): String
    +isEnabled(): boolean
}

class Pet {
    -id: Long
    -petCode: String
    -name: String
    -species: String
    -breed: String
    -dateOfBirth: LocalDate
    -gender: String
    -weight: Double
    -color: String
    -microchipNumber: String
    +getOwner(): User
    +setWeight(Double): void
}

class VeterinarianProfile {
    -id: Long
    -specialization: String
    -clinicName: String
    -clinicAddress: String
    -consultationFee: Double
    -workingDays: String
    -workStartTime: String
    -workEndTime: String
    -licenseNumber: String
}

class Appointment {
    -id: Long
    -appointmentDate: LocalDate
    -appointmentTime: String
    -status: String
    -fee: Double
    -paymentStatus: String
    -razorpayOrderId: String
    -razorpayPaymentId: String
    -notes: String
    +setStatus(String): void
}

class PetMedicalRecord {
    -id: Long
    -examinationDate: LocalDate
    -weightKg: Double
    -healthStatus: String
    -symptoms: String
    -diagnosis: String
    -treatment: String
    -medication: String
    -followUpRequired: Boolean
    -followUpDate: LocalDate
}

class Prescription {
    -id: Long
    -medicineName: String
    -dosage: String
    -frequency: String
    -duration: String
    -instructions: String
}

class PetVaccinationRecord {
    -id: Long
    -vaccineName: String
    -administeredDate: LocalDate
    -nextDueDate: LocalDate
    -lotNumber: String
    -administeredBy: String
}

class Shelter {
    -id: Long
    -shelterName: String
    -organizationType: ShelterOrganizationType
    -address: String
    -city: String
    -registrationNumber: String
    -isVerified: boolean
}

class Animal {
    -id: Long
    -animalCode: String
    -name: String
    -species: String
    -breed: String
    -sex: AnimalSex
    -status: AnimalStatus
    -sterilizationStatus: SterilizationStatus
}

class AdoptionListing {
    -id: Long
    -title: String
    -description: String
    -status: String
    -publishedAt: LocalDateTime
}

class AdoptionApplication {
    -id: Long
    -status: AdoptionApplicationStatus
    -housingType: HousingType
    -hasGarden: Boolean
    -createdAt: LocalDateTime
}

class Product {
    -id: Long
    -name: String
    -sku: String
    -category: String
    -basePrice: BigDecimal
    -status: ProductStatus
}

class Order {
    -id: Long
    -orderNumber: String
    -totalAmount: BigDecimal
    -orderStatus: String
    -paymentStatus: String
}

class OrderItem {
    -id: Long
    -quantity: Integer
    -priceAtPurchase: BigDecimal
}

class Payment {
    -id: Long
    -razorpayOrderId: String
    -razorpayPaymentId: String
    -amount: BigDecimal
    -status: PaymentStatus
    -paymentType: PaymentType
}

class VetScanRecord {
    -id: Long
    -imageHash: String
    -predictedClass: String
    -confidenceScore: Double
    -severityLevel: String
    -triageRecommendation: String
}

' Relationships derived directly from JPA annotations
User "1" *-- "*" Pet : owns
User "1" -- "0..1" VeterinarianProfile : has
User "1" -- "0..1" Shelter : manages

Appointment "*" --> "1" Pet : scheduled_for
Appointment "*" --> "1" User : owner
Appointment "*" --> "1" User : veterinarian

PetMedicalRecord "*" --> "1" Pet : documents
PetMedicalRecord "*" --> "1" User : veterinarian
PetMedicalRecord "0..1" -- "1" Appointment : linked_to

Prescription "*" --> "1" Appointment : prescribed_in
Prescription "*" --> "1" Pet : prescribed_for

PetVaccinationRecord "*" --> "1" Pet : immunizes

Shelter "1" *-- "*" Animal : houses
Animal "1" -- "0..1" AdoptionListing : listed_in
AdoptionListing "1" *-- "*" AdoptionApplication : receives
AdoptionApplication "*" --> "1" User : submitted_by

User "1" *-- "*" Order : places
Order "1" *-- "1..*" OrderItem : contains
OrderItem "*" --> "1" Product : references

Payment "0..1" -- "1" Appointment : settles
Payment "0..1" -- "1" Order : settles

Pet "1" *-- "*" VetScanRecord : screened_by

@enduml
"""

# -------------------------------------------------------------
# 06-object.puml
# -------------------------------------------------------------
OBJECT_PUML = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundColor #FFFFFF
skinparam dpi 300
skinparam defaultFontName "Helvetica"
skinparam defaultFontSize 11
skinparam roundCorner 4
skinparam ArrowColor #000000
skinparam ObjectBorderColor #000000

title Illustrative Object Snapshot: Confirmed Clinical Consultation & Prescription

object "owner_aravind : User" as Owner {
    id = 101
    email = "aravind@example.com"
    name = "Aravind Menon"
    role = "ROLE_PET_OWNER"
    verificationStatus = APPROVED
    enabled = true
}

object "pet_buddy : Pet" as PetObj {
    id = 205
    petCode = "PET-2026-0205"
    name = "Buddy"
    species = "Canine"
    breed = "Golden Retriever"
    weight = 28.5
    gender = "Male"
}

object "vet_arun : User" as VetUser {
    id = 302
    email = "dr.arun@petcareclinic.com"
    name = "Dr. Arun T. S."
    role = "ROLE_VETERINARIAN"
    verificationStatus = APPROVED
    enabled = true
}

object "vet_profile : VeterinarianProfile" as VetProfile {
    id = 401
    clinicName = "Pet Care Clinic"
    specialization = "Veterinary Surgery & Dermatology"
    consultationFee = 500.00
    workingDays = "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY"
    workStartTime = "09:00 AM"
    workEndTime = "05:00 PM"
}

object "appt_941 : Appointment" as Appt {
    id = 941
    appointmentDate = 2026-10-25
    appointmentTime = "10:30 AM"
    status = "CONFIRMED"
    fee = 500.00
    paymentStatus = "PAID"
    razorpayOrderId = "order_NJ410294"
    razorpayPaymentId = "pay_NJ4108821"
}

object "payment_rzp : Payment" as PaymentObj {
    id = 1502
    razorpayOrderId = "order_NJ410294"
    razorpayPaymentId = "pay_NJ4108821"
    amount = 500.00
    status = PAID
    paymentType = CONSULTATION
}

object "record_301 : PetMedicalRecord" as MedRecord {
    id = 301
    examinationDate = 2026-10-25
    weightKg = 28.5
    healthStatus = "Recovering"
    diagnosis = "Canine Atopic Dermatitis"
    treatment = "Topical antiseptic wash & oral antipruritic"
    followUpRequired = true
    followUpDate = 2026-11-08
}

object "rx_101 : Prescription" as RxItem {
    id = 101
    medicineName = "Apoquel 16mg"
    dosage = "1 tablet"
    frequency = "Once daily"
    duration = "14 days"
    instructions = "Administer with food in the morning"
}

object "scan_record_77 : VetScanRecord" as ScanRecord {
    id = 77
    predictedClass = "Atopic Dermatitis"
    confidenceScore = 0.892
    severityLevel = "Moderate"
    triageRecommendation = "Schedule Veterinary Examination"
}

' Links connecting instances according to class associations
Owner --> PetObj : owns
VetUser --> VetProfile : possesses
Owner --> Appt : books
VetUser --> Appt : assigned_to
PetObj --> Appt : scheduled_for

Appt --> PaymentObj : settled_by
Owner --> PaymentObj : paid_by

Appt --> MedRecord : resulted_in
PetObj --> MedRecord : holds
VetUser --> MedRecord : examined_by

MedRecord --> RxItem : includes
Appt --> RxItem : issued_under
PetObj --> RxItem : prescribed_to

PetObj --> ScanRecord : evaluated_by

@enduml
"""

# -------------------------------------------------------------
# 07-component.puml
# -------------------------------------------------------------
COMPONENT_PUML = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundColor #FFFFFF
skinparam dpi 300
skinparam defaultFontName "Helvetica"
skinparam defaultFontSize 10
skinparam roundCorner 4
skinparam ArrowColor #000000
skinparam ComponentBorderColor #000000
skinparam InterfaceBorderColor #000000

package "Presentation Tier (React SPA)" {
    [UI Components & Pages\\n(React 19 / Vite / Tailwind)] as ReactUI
    [API Client\\n(Axios Interceptors)] as AxiosClient
    [Real-Time Client\\n(STOMP over SockJS)] as StompClient
    ReactUI ..> AxiosClient : uses
    ReactUI ..> StompClient : uses
}

package "Security & Gateway Layer" {
    [Security Filter Chain] as SecurityFilter
    [JwtAuthenticationFilter] as JwtFilter
    [CorsFilter] as CorsHandler
    SecurityFilter --> JwtFilter
    SecurityFilter --> CorsHandler
}

package "Spring Boot Application Services" {
    package "User & Auth" {
        [AuthService] as AuthService
        [UserService] as UserService
        [VerificationService] as VerifyService
    }
    package "Clinical & Healthcare" {
        [AppointmentService] as ApptService
        [PetClinicalService] as ClinicalService
        [PrescriptionService] as RxService
        [VetProfileService] as VetProfileService
    }
    package "Shelter & Adoption" {
        [AdoptionApplicationService] as AdoptAppService
        [ShelterService] as ShelterService
        [PublicAdoptionService] as PublicAdoptService
        [PetRehomeService] as RehomeService
    }
    package "Pet Marketplace" {
        [ProductService] as ProdService
        [OrderService] as OrderService
        [PaymentService] as PayService
    }
    package "Real-Time & AI" {
        [NotificationService] as NotifyService
        [AiChatService] as AiChat
        [PatientContextService] as ContextService
        [VetScanService] as VetScanService
    }
}

package "Data Access Tier (JPA / Hibernate)" {
    [Spring Data Repositories\\n(UserRepository, PetRepository, ApptRepository...)] as Repositories
}

database "PostgreSQL 16 Database" as PostgresDB {
    [Relational Schemas & Tables] as DBTables
}

package "External Services & AI Systems" {
    [FastAPI VetScan Microservice\\n(PyTorch / Port 8001)] as VetScanPy
    [Google Gemini 1.5 Flash API] as GeminiAPI
    [Razorpay Payment API] as RazorpayAPI
}

' Wiring & Interfaces
AxiosClient ..> SecurityFilter : HTTP REST /api/*
StompClient ..> NotifyService : WS /ws-chat

SecurityFilter --> AuthService
SecurityFilter --> ApptService
SecurityFilter --> ClinicalService
SecurityFilter --> AdoptAppService
SecurityFilter --> ProdService
SecurityFilter --> AiChat
SecurityFilter --> VetScanService

ApptService --> Repositories
ClinicalService --> Repositories
AdoptAppService --> Repositories
ProdService --> Repositories
AuthService --> Repositories

ApptService ..> PayService : delegates payment
PayService ..> RazorpayAPI : HTTPS TLS 1.3
ApptService ..> NotifyService : dispatches alerts

AiChat --> ContextService : resolves pet EHR
ContextService --> Repositories
AiChat ..> GeminiAPI : HTTPS REST

VetScanService ..> VetScanPy : HTTP REST :8001
VetScanService --> Repositories

Repositories --> DBTables : JDBC / HikariCP Pool

@enduml
"""

# -------------------------------------------------------------
# 08-deployment.puml
# -------------------------------------------------------------
DEPLOYMENT_PUML = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundColor #FFFFFF
skinparam dpi 300
skinparam defaultFontName "Helvetica"
skinparam defaultFontSize 10
skinparam roundCorner 4
skinparam ArrowColor #000000
skinparam NodeBorderColor #000000

node "Client Workstation / Mobile Device" <<device>> as ClientDevice {
    node "Modern Web Browser (Chrome, Firefox, Edge)" <<execution environment>> as WebBrowser {
        artifact "React 19 SPA Bundle\\n(HTML5 / CSS / Vite JS)" as FrontendArtifact
        artifact "Client State & Token Cache\\n(JWT in LocalStorage)" as TokenStore
    }
}

node "Cloud / Host Application Server (Ubuntu 22.04 LTS)" <<server>> as AppServer {

    node "Static Web Hosting / Reverse Proxy (Nginx / Azure)" <<execution environment>> as WebServer {
        artifact "Static Production Assets (dist/)" as DistFiles
    }

    node "Docker Engine" <<execution environment>> as DockerHost {

        node "Spring Boot Container" <<container>> as SpringContainer {
            node "Java 21 / 25 JVM Runtime" <<execution environment>> as JVM {
                artifact "petzoe-api-0.0.1-SNAPSHOT.jar" as BackendJar
                artifact "Embedded Apache Tomcat (Port 8080)" as Tomcat
            }
        }

        node "VetScan AI Container" <<container>> as AIContainer {
            node "Python 3.11 Runtime (Uvicorn)" <<execution environment>> as PythonRuntime {
                artifact "petscan-ai-service (FastAPI Port 8001)" as PythonApp
                artifact "PyTorch Model Weights (best_model.pth)" as ModelWeights
            }
        }

        node "Database Container" <<container>> as DBContainer {
            node "PostgreSQL 16 Server (Port 5432)" <<execution environment>> as PostgresInstance {
                database "petzoe_db Relational Data" as PetZoeDB
                storage "Mounted Volume: pgdata" as DBVolume
            }
        }
        
        storage "Mounted Volume: /uploads" as UploadsVolume
    }
}

cloud "External Third-Party Cloud Services" as CloudServices {
    node "Razorpay Cloud Platform" <<external service>> as RazorpayGateway
    node "Google Cloud AI" <<external service>> as GeminiCloud
}

' Communication paths and protocols
ClientDevice -- AppServer : HTTPS (TLS 1.3) / Port 443
FrontendArtifact ..> Tomcat : HTTPS REST /api/*
FrontendArtifact ..> Tomcat : WSS WebSocket /ws-chat
Tomcat ..> PythonApp : HTTP REST (Internal Docker Network :8001)
Tomcat ..> PostgresInstance : TCP / JDBC (HikariCP Port 5432)
Tomcat ..> UploadsVolume : Local POSIX File I/O
PostgresInstance ..> DBVolume : Block Storage Write

Tomcat ..> RazorpayGateway : HTTPS API Calls (Port 443)
Tomcat ..> GeminiCloud : HTTPS REST API Calls (Port 443)

@enduml
"""

# -------------------------------------------------------------
# 09-communication.puml
# -------------------------------------------------------------
COMMUNICATION_PUML = """@startuml
skinparam monochrome true
skinparam shadowing false
skinparam backgroundColor #FFFFFF
skinparam dpi 300
skinparam defaultFontName "Helvetica"
skinparam defaultFontSize 10
skinparam roundCorner 4
skinparam ArrowColor #000000

title Collaboration Diagram: Authenticated Pet Owner Requesting Pet Medical History via AI Care Assistant

rectangle "owner : Pet Owner" as Owner
rectangle "chatUI : React Chatbot UI" as UI
rectangle "jwtFilter : JwtAuthenticationFilter" as Filter
rectangle "chatController : ChatController" as Controller
rectangle "aiChatService : AiChatService" as Service
rectangle "contextService : PatientContextService" as ContextSvc
rectangle "userRepo : UserRepository" as UserRepo
rectangle "petRepo : PetRepository" as PetRepo
rectangle "medRepo : PetMedicalRecordRepository" as MedRepo
rectangle "modelService : GeminiChatModelService" as ModelSvc

Owner -right- UI : 1: asksQuestion("What is Buddy's medical and vaccine history?") >\\n8: viewsRenderedResponse() <
UI -down- Filter : 1.1: POST /api/chat/message (Bearer token) >\\n7.1: returns200OK(AiChatResponseDTO) <
Filter -right- Controller : 1.2: doFilterInternal(authenticatedRequest) >
Controller -down- Service : 1.3: processMessage(requestDTO, userEmail, isPublic=false) >\\n7: returnsAiChatResponseDTO() <
Service -right- ContextSvc : 1.4: resolvePatientContext(userEmail, "Buddy", prompt) >\\n5: returnsPatientContextDTO() <
ContextSvc -down- UserRepo : 2: findByEmail(userEmail) >
ContextSvc -down- PetRepo : 3: findByOwnerIdAndName(userId, "Buddy") >
ContextSvc -down- MedRepo : 4: findByPetIdOrderByExaminationDateDesc(petId) >
Service -down- ModelSvc : 6: generateChatResponse(groundedClinicalPrompt) >\\n6.1: returnsGeneratedTextWithCitations() <

@enduml
"""

DIAGRAMS = {
    "01-use-case.puml": USE_CASE_PUML,
    "02-sequence.puml": SEQUENCE_PUML,
    "03-state-machine.puml": STATE_MACHINE_PUML,
    "04-activity.puml": ACTIVITY_PUML,
    "05-class.puml": CLASS_PUML,
    "06-object.puml": OBJECT_PUML,
    "07-component.puml": COMPONENT_PUML,
    "08-deployment.puml": DEPLOYMENT_PUML,
    "09-communication.puml": COMMUNICATION_PUML,
}

for filename, content in DIAGRAMS.items():
    puml_path = SOURCE_DIR / filename
    puml_path.write_text(content.strip(), encoding="utf-8")
    print(f"Written: {puml_path}")

print("All 9 PUML files written successfully.")
