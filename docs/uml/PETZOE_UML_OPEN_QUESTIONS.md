# PETZOE UML SPECIFICATION: OPEN ARCHITECTURAL QUESTIONS

This document records the specific design decisions and minor discrepancies requiring student / project-guide confirmation prior to final report binding.

---

## 1. Diagram 8 & 9 Academic Classification (Package vs. Collaboration Diagram)
* **Background:** The academic guidelines for MCA systems modeling standardly list either:
  * **Option A (Reference Document Style):** Diagram 8 is *Deployment Diagram* and Diagram 9 is *Collaboration Diagram* (Interaction Diagram showing numbered message passing between object instances).
  * **Option B (Structural Modeling Style):** Diagram 8 is *Package Diagram* (showing architectural Java/React package layering) and Diagram 9 is *Object Diagram*.
* **Status:** Both sets of specifications have been extracted. The college reference document from Amal Jyothi specifically features the **Collaboration Diagram** with 28 numbered method invocations.
* **Question for Project Owner:** Does your evaluation panel require the **Collaboration Diagram** (matching the uploaded reference PDF) or the **Package Diagram**?

---

## 2. Naming Consistency in Diagram Titles (`PetZoe` vs. `PetVerse`)
* **Background:** The project codebase is named `PetZoe` (`com.petzoe.api`, `PetZoeApplication.java`, UI headers). However, the semester mini-project documentation and reference diagram headers read `PetVerse` (e.g., `Digital Pet Healthcare & Veterinary Management System (PetVerse)`).
* **Status:** Current specifications use `PetZoe (PetVerse)` to bridge both phases.
* **Question for Project Owner:** Should the final diagram headings strictly read `PetZoe` or retain the dual title `PetZoe (PetVerse)` for historical project continuity?

---

## 3. Database Engine Label (`PostgreSQL` vs. `MySQL`)
* **Background:** The reference diagrams on pages 3, 4, and 6 label the persistence layer as `Database (MySQL)`. However, the implemented codebase uses `PostgreSQL 16` via `org.postgresql:postgresql` in `pom.xml`.
* **Status:** The backend logic, JPA entities, and relational tables operate identically under both RDBMS engines via Hibernate ORM.
* **Question for Project Owner:** Should the database node be labelled as `PostgreSQL` (reflecting actual implementation) or `MySQL` (matching the previous document draft)?

---

## 4. Payment Gateway Deployment Configuration (`Live Mode` vs. `Mock Mode`)
* **Background:** `AppointmentService.java` and `PaymentService.java` implement an automated dual-mode check: if Razorpay keys contain placeholders, the system generates simulated `order_mock_*` orders to enable complete end-to-end testing without external network dependencies.
* **Status:** Both modes are fully verified in the code.
* **Question for Project Owner:** In presentation viva, will the project be demonstrated using live Razorpay test keys or the internal simulated mock transaction engine?
