# PETZOE UML DIAGRAM PLAN & RENDERING STRATEGY

This document establishes the diagram decomposition, spatial positioning rules, and layout rendering strategies to produce clean, untangled, academically compliant UML diagrams.

---

## 1. Core Rendering Principle: Avoiding Line Tangling
The primary issue with automated UML generation (such as default PlantUML / Graphviz force-directed layouts) is that connectors bend diagonally and cross through unrelated boxes, creating an unreadable "spaghetti" effect.

To match the clean, professional appearance of the Amal Jyothi College of Engineering reference document, all diagram generation must enforce:
1. **Strictly Orthogonal Routing:** All relationship lines and dependency arrows must use 90-degree right angles with minimal bends. Diagonal lines across panels are prohibited.
2. **Deterministic Grid Positioning:** Components, states, and entities must be aligned along predefined row and column coordinates.
3. **Dedicated Actor Columns:** Actors must reside exclusively along the outer left and right margins, never interspersed within internal subsystem boundaries.
4. **Hierarchical Directionality:** Information flow must proceed strictly from Left-to-Right or Top-to-Bottom.

---

## 2. Diagram-by-Diagram Spatial & Layout Plan

```text
+----------------------------------------------------------------------------------------------------+
| 1. USE CASE DIAGRAM (3-Column Layout)                                                              |
| [Pet Owner]      --> [Column A: Identity, EHR, Appointments, Adoptions] <-- [Veterinarian]         |
| [Shelter Mgr]    --> [Column B: Prescriptions, Products, Orders, Admin] <-- [Marketplace Seller]   |
|                      ================================================== <-- [Administrator]        |
|                      System Boundary: "Digital Pet Healthcare & Veterinary Management System"      |
+----------------------------------------------------------------------------------------------------+
| 2. SEQUENCE DIAGRAM (Linear Timeline)                                                              |
| [Pet Owner]   |   [Web App]   |   [Backend Server]   |   [Veterinarian Portal]   |   [Database]    |
|      |                |                   |                         |                    |         |
|   1. Login ---------> |                   |                         |                    |         |
|      |                | 1.1 Authenticate> |                         |                    |         |
|      |                |                   | 1.2 Verify Credentials> |                    |         |
|   (Steps 1 to 7.1 executed strictly horizontally with downward chronological spacing)              |
+----------------------------------------------------------------------------------------------------+
| 3. STATE DIAGRAM (2 x 4 Symmetric Multi-Panel Grid)                                                |
| Panel 1: [User Account State]           | Panel 2: [Appointment & Booking State]                   |
| Panel 3: [Consultation State]           | Panel 4: [Medical Record State]                          |
| Panel 5: [Prescription State]           | Panel 6: [Payment State]                                 |
| Panel 7: [Adoption State]               | Panel 8: [System Access & Role State]                    |
| (Each state machine self-contained with its own [*] initial and final states; zero cross-panel links)|
+----------------------------------------------------------------------------------------------------+
| 4. ACTIVITY DIAGRAM (5-Column Vertical Swimlanes)                                                  |
| | Pet Owner |     | System |     | Veterinarian |     | Shelter Manager |     | Administrator |    |
|      |                 |                |                     |                     |              |
| [Open Web/App]         |                |                     |                     |              |
| [Register/Login]       |                |                     |                     |              |
|      | ---------> [Authenticate]        |                     |                     |              |
| (Workflows proceed downwards with explicit decision diamonds exiting horizontally to adjacent lanes) |
+----------------------------------------------------------------------------------------------------+
| 5. CLASS DIAGRAM (Hierarchical Tree Tiering)                                                       |
|                                [ User (Abstract) ]                                                 |
|          +------------------+-----------+--------------------+                                     |
|          |                  |           |                    |                                     |
|     [ Owner ]        [ Veterinarian ]   [ ShelterManager ]   [ Administrator ]                     |
|          |                  |           |                    |                                     |
|    [ Pet ] ----> [ Appointment ] ----> [ Consultation ] ----> [ MedicalRecord ]                    |
|                     |                   |                                                          |
|                 [ Payment ]         [ Prescription ]                                               |
+----------------------------------------------------------------------------------------------------+
| 6. OBJECT DIAGRAM (4-Tier Instance Matrix)                                                         |
| Tier 1 (Users):       [u1:PetOwner]      [vet1:Veterinarian]    [sh1:ShelterManager] [admin1:Admin]|
| Tier 2 (Core):        [pet1:Pet]         [appt1:Appointment]    [srv1:Service]       [ps1:Provider]|
| Tier 3 (Clinical):    [cons1:Consult]    [pres1:Prescription]   [pay1:Payment]       [notif1:Notif]|
| Tier 4 (Adoption):    [adoptReq1:Req]    [adopt1:Adoption]      [shelter1:Shelter]   [chat1:Chat]  |
+----------------------------------------------------------------------------------------------------+
| 7. COMPONENT DIAGRAM (Layered Microservice Block)                                                  |
| Top:       [ Client Applications: WebApp (React), MobileApp, VetPortal, ShelterPortal, AdminDash ] |
| Middle:    [ PetVerse Backend Services with 9 Interface Lollipops: Auth, Pet, Appt, Consult... ]   |
| Left-Bot:  [ Data Persistence: MySQL / PostgreSQL, Redis, Cloud Storage ]                          |
| Right-Bot: [ External Services: Firebase Auth, Razorpay, Video Call, Google Maps, Gemini AI ]      |
+----------------------------------------------------------------------------------------------------+
| 8. DEPLOYMENT DIAGRAM (Physical Distributed Infrastructure)                                        |
| [ Client Devices ] <== HTTPS (SSL/TLS) ==> [ Web Server (Nginx) ] <== HTTPS ==> [ App Server ]     |
|                                                                                      ||            |
| [ External Services: Razorpay, Gemini, FCM ] <====== HTTPS ==========================||            |
|                                                                                      || (TCP 5432) |
|                                                                          [ Database: PostgreSQL ]  |
+----------------------------------------------------------------------------------------------------+
| 9. COLLABORATION DIAGRAM (Numbered Invocations Grid)                                               |
| Symmetrical object rectangles connected by straight links with chronological method annotations:    |
|   1: registerPet() >      2: bookAppointment() >      3: checkAppointment() >      ... 28: send()   |
| Bottom-Right Legend: [ Note: Sequence is indicated by numbering of messages (method calls) ]        |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Recommended Diagram Generation Sequence

To maintain architectural integrity and vocabulary synchronization across all diagrams, they should be generated in the following strict order:

1. **Step 1: System Scope & Class Diagram (`Class Diagram`)**  
   *Establishes the authoritative naming of entities, attributes, visibility, and foreign-key cardinalities.*
2. **Step 2: Object Snapshot (`Object Diagram`)**  
   *Validates concrete instances and attribute types against the Class Diagram.*
3. **Step 3: User Functional Mapping (`Use Case Diagram`)**  
   *Maps human actors to implemented subsystems within the official system boundary.*
4. **Step 4: Procedural Interaction (`Sequence Diagram`)**  
   *Models time-ordered API calls and database commits for the core appointment booking scenario.*
5. **Step 5: Structural Collaboration (`Collaboration Diagram`)**  
   *Complements the Sequence Diagram by demonstrating structural object linkages and numbered calls.*
6. **Step 6: Business Activity Workflows (`Activity Diagram`)**  
   *Maps cross-functional processes across the 5 stakeholder swimlanes.*
7. **Step 7: Lifecycle State Machines (`State Diagram`)**  
   *Models the 8 entity lifecycle states and valid transitions.*
8. **Step 8: Software Components & Interfaces (`Component Diagram`)**  
   *Groups service classes into modular functional packages with interface lollipops.*
9. **Step 9: Physical Infrastructure (`Deployment Diagram`)**  
   *Maps compiled software artifacts into physical nodes, containers, and network communication paths.*
