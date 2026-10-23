# PetVerse / PetZoe UML 2.x Architecture Diagrams

This directory contains all nine official UML diagrams for the **PetVerse / PetZoe – Digital Pet Healthcare, Veterinary Management, Adoption, and Pet Marketplace System**, modeled and formatted in strict alignment with the Department of Computer Applications, Amal Jyothi College of Engineering requirements.

---

## Directory Structure

```text
docs/uml/
├── README.md               # Detailed documentation and regeneration instructions
├── source/                 # PlantUML source files (.puml)
│   ├── 01-use-case.puml
│   ├── 02-sequence.puml
│   ├── 03-state-machine.puml
│   ├── 04-activity.puml
│   ├── 05-class.puml
│   ├── 06-object.puml
│   ├── 07-component.puml
│   ├── 08-deployment.puml
│   └── 09-communication.puml
└── png/                    # Rendered black-and-white PNG diagrams
    ├── 01-use-case.png
    ├── 02-sequence.png
    ├── 03-state-machine.png
    ├── 04-activity.png
    ├── 05-class.png
    ├── 06-object.png
    ├── 07-component.png
    ├── 08-deployment.png
    └── 09-communication.png
```

---

## Diagram Overview

| # | Diagram Name | PNG File | Reference Format Details |
|---|---|---|---|
| 1 | **Use Case Diagram** | [`01-use-case.png`](file:///d:/AMALJYOTHI/FINAL%20YEAR%20PROJECT/PetZoe/docs/uml/png/01-use-case.png) | Actors: Pet Owner, Shelter Manager (Left); Veterinarian, Marketplace Seller, Administrator (Right). Subsystems: Auth, Manage Pets, Book Appointment, Pet Adoption Management, Manage Shelter Pets, Consultation, Manage Medical Records, Schedule Management, Manage Products, Manage Orders, System Administration with `<<include>>` and `<<extend>>`. |
| 2 | **Sequence Diagram** | [`02-sequence.png`](file:///d:/AMALJYOTHI/FINAL%20YEAR%20PROJECT/PetZoe/docs/uml/png/02-sequence.png) | Scenario: *Book Veterinary Appointment*. Participants: Pet Owner, Web Application, Backend Server, Veterinarian Portal, Database (MySQL/PostgreSQL) with chronological steps 1 to 7.1. |
| 3 | **State Machine Diagram** | [`03-state-machine.png`](file:///d:/AMALJYOTHI/FINAL%20YEAR%20PROJECT/PetZoe/docs/uml/png/03-state-machine.png) | 8 Modular State Models: User Account State, Appointment & Booking State, Consultation State, Medical Record State, Prescription State, Payment State, Adoption State, System Access & Role State. |
| 4 | **Activity Diagram** | [`04-activity.png`](file:///d:/AMALJYOTHI/FINAL%20YEAR%20PROJECT/PetZoe/docs/uml/png/04-activity.png) | Five swimlanes: Pet Owner, System, Veterinarian, Shelter Manager, Administrator. Full appointment booking, clinical consultation, adoption approval, and system governance workflow. |
| 5 | **Class Diagram** | [`05-class.png`](file:///d:/AMALJYOTHI/FINAL%20YEAR%20PROJECT/PetZoe/docs/uml/png/05-class.png) | Domain Model: User (Abstract), Owner, Veterinarian, Shelter Manager, Administrator, Role, Pet, Appointment, Consultation, Prescription, MedicalRecord, Vaccination, LabTest, Payment, Adoption, Shelter, AdoptionRequest, Notification, Review. |
| 6 | **Object Diagram** | [`06-object.png`](file:///d:/AMALJYOTHI/FINAL%20YEAR%20PROJECT/PetZoe/docs/uml/png/06-object.png) | Concrete instances: u1:PetOwner, vet1:Veterinarian, sh1:ShelterManager, admin1:Administrator, cat1:PetCategory, pet1:Pet, appt1:Appointment, cons1:Consultation, pres1:Prescription, srv1:Service, ps1:ProviderService, pay1:Payment, notif1:Notification, rev1:Review, chat1:ChatSession, msg1:Message, adoptReq1:AdoptionRequest, adopt1:Adoption, shelter1:Shelter. |
| 7 | **Component Diagram** | [`07-component.png`](file:///d:/AMALJYOTHI/FINAL%20YEAR%20PROJECT/PetZoe/docs/uml/png/07-component.png) | Client Applications, PetVerse Application Backend Services with interface lollipops, Data Storage & Persistence Layer, External Services & Integrations. |
| 8 | **Deployment Diagram** | [`08-deployment.png`](file:///d:/AMALJYOTHI/FINAL%20YEAR%20PROJECT/PetZoe/docs/uml/png/08-deployment.png) | Client Devices, Web Server (Nginx), Application Server (Node.js/Spring Boot), Database Server (MySQL/PostgreSQL), Cloud Storage, Notification Service, External Services, Third-Party Integrations. |
| 9 | **Collaboration Diagram** | [`09-communication.png`](file:///d:/AMALJYOTHI/FINAL%20YEAR%20PROJECT/PetZoe/docs/uml/png/09-communication.png) | Object communication layout with numbered method calls (1 through 28) tracking appointment booking, consultation, payments, adoptions, reviews, and messaging. |

---

## How to Regenerate Diagrams

From PowerShell or command prompt:

```powershell
$java = "C:\Program Files\Java\jdk-25.0.2\bin\java.exe"
$jar = "D:\AMALJYOTHI\final project docs\Diagrams\plantuml.jar"
$src = "d:\AMALJYOTHI\FINAL YEAR PROJECT\PetZoe\docs\uml\source\*.puml"
$out = "d:\AMALJYOTHI\FINAL YEAR PROJECT\PetZoe\docs\uml\png"

& $java -jar $jar -tpng $src -o $out
```
