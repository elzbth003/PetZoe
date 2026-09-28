# SOFTWARE TEST REPORT: COMPREHENSIVE WORKFLOW & FORM VALIDATION AUTOMATION TESTING
**Project Title:** PetZoe - Digital Pet Healthcare & Veterinary Management System  
**Module Name:** Complete System Workflow, Role-Based Lifecycles & Form Validation Automation  
**Testing Type:** End-to-End Automated Functional, UI, Security, and Input Validation Testing  
**Tool / Framework:** Selenium WebDriver 4.19.1 + JUnit Jupiter 5.10.2 + Chrome Headless  
**Execution Environment:** Google Chrome 153.x / ChromeDriver (Auto-provisioned via Selenium Manager)  
**Date of Execution:** September 18, 2026  
**Status:** **PASSED (100% - 40/40 UI & Validation Tests, 19/19 Backend Integration Tests)**

---

## 1. Document Control & Overview

| Attribute | Details |
| :--- | :--- |
| **Document Version** | 3.0 |
| **Project** | PetZoe Web Application (`http://localhost:5173`) |
| **Backend API** | Spring Boot REST Services (`http://localhost:8080`) |
| **Test Suites** | `ValidationWorkflowTest`, `AuthWorkflowTest`, `AdminWorkflowTest`, `PetManagementWorkflowTest`, `PetHealthWorkflowTest`, `AppointmentWorkflowTest`, `RehomingWorkflowTest`, `PetIdCentricSeleniumTest`, `LoginPageTest` |
| **Author / Tester** | Final Year Project Team |
| **Verified By** | Project Supervisor / QA Lead |

---

## 2. Testing Objectives & Scope

### 2.1 Objectives
1. Verify client-side and asynchronous form validation rules (React Hook Form & Zod schema enforcement) across all system entry points.
2. Validate negative validation boundaries: blank field requirements, pattern regex mismatches (Email, Phone, Names), boundary lengths (password, pet age, pet weight), and confirm-password mismatches.
3. Verify end-to-end multi-role workflows across Pet Owner, Veterinarian, and System Administrator accounts.
4. Validate role-based route protection, JWT authentication persistence, and secure logout teardown.
5. Validate permanent Pet ID (`PZ-PET-XXXXXX`) generation, display badges, ownership transfer modals, and veterinarian patient lookup.
6. Validate clinical booking flows: veterinarian selection, consultation slot booking, and blank form negative validation.
7. Validate community pet rehoming: public listing discovery, species filters, and adoption application modal flows.

### 2.2 Scope Coverage
- **Form & Input Validations:** Registration, Login, Forgot Password, Pet Registration Modal, Clinical Consultation Booking.
- **Authentication & Security:** Login, negative credential toasts, JWT storage in `localStorage`, session persistence across reloads, protected route redirection.
- **Pet Management:** Dashboard metric cards, pet registration with client validation, permanent Pet ID badges, ownership transfer dialogs.
- **Clinical Veterinary Consultations:** Appointment booking dialog, doctor selection, date-time picking, error validation on empty submission.
- **Pet Health & Medical History:** Medical consultations list, vaccination records tabs, anonymous access denial.
- **Community Rehoming:** Rehoming board listing retrieval, species filtering (Dogs/Cats/All), multi-step application submission.
- **Administration:** User directory table, live email search filter, RBAC unauthorized access blocking.

---

## 3. Test Environment & Technical Stack

| Component | Specification |
| :--- | :--- |
| **Operating System** | Windows 11 (64-bit) |
| **Client Frontend** | React 19, Vite 8, Tailwind CSS, Lucide Icons, React Hook Form, Zod |
| **Backend Framework** | Spring Boot 3.3.2, Spring Security 6, Hibernate 6 |
| **Database** | PostgreSQL 18 (Local Instance: `jdbc:postgresql://localhost:5432/petzoe_db`) |
| **Java Runtime** | Java 25.0.2 (Oracle Corporation) |
| **Build & Test Runner** | Apache Maven 3.9.16 / JUnit Platform Provider / Surefire 3.2.5 |
| **Browser Automation Engine** | Selenium WebDriver 4.19.1 (Java Binding) |
| **Browser & Driver** | Google Chrome Version 153.0.8010.47 / ChromeDriver |
| **Execution Resolution** | 1920 x 1080 (High-Definition Desktop Viewport) |

---

## 4. Test Execution Summary

```
-------------------------------------------------------------------------------
Test Set: Consolidated Selenium UI & Form Validation Suites
-------------------------------------------------------------------------------
ValidationWorkflowTest:        13 Run,  0 Failures, 0 Errors, 0 Skipped
LoginPageTest:                  7 Run,  0 Failures, 0 Errors, 0 Skipped
PetIdCentricSeleniumTest:       2 Run,  0 Failures, 0 Errors, 0 Skipped
AppointmentWorkflowTest:        3 Run,  0 Failures, 0 Errors, 0 Skipped
AdminWorkflowTest:              3 Run,  0 Failures, 0 Errors, 0 Skipped
AuthWorkflowTest:               4 Run,  0 Failures, 0 Errors, 0 Skipped
PetHealthWorkflowTest:          2 Run,  0 Failures, 0 Errors, 0 Skipped
PetManagementWorkflowTest:      4 Run,  0 Failures, 0 Errors, 0 Skipped
RehomingWorkflowTest:           2 Run,  0 Failures, 0 Errors, 0 Skipped
-------------------------------------------------------------------------------
Total Selenium UI Tests Run:   40
Failures:                       0
Errors:                         0
Skipped:                        0
Success Rate:                   100.0%
Build Status:                   BUILD SUCCESS
-------------------------------------------------------------------------------
```

### Metrics Breakdown

| Category | Test Suite Class | Tests Run | Passed | Failed | Errors | Success Rate |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Form & Input Validation** | `ValidationWorkflowTest` | 13 | 13 | 0 | 0 | **100%** |
| **Authentication Core UI** | `LoginPageTest` | 7 | 7 | 0 | 0 | **100%** |
| **Auth Workflow & RBAC** | `AuthWorkflowTest` | 4 | 4 | 0 | 0 | **100%** |
| **Pet ID Architecture** | `PetIdCentricSeleniumTest` | 2 | 2 | 0 | 0 | **100%** |
| **Pet Management & Reg** | `PetManagementWorkflowTest` | 4 | 4 | 0 | 0 | **100%** |
| **Medical & Health Records**| `PetHealthWorkflowTest` | 2 | 2 | 0 | 0 | **100%** |
| **Veterinary Appointments** | `AppointmentWorkflowTest` | 3 | 3 | 0 | 0 | **100%** |
| **Community Rehoming** | `RehomingWorkflowTest` | 2 | 2 | 0 | 0 | **100%** |
| **System Administration** | `AdminWorkflowTest` | 3 | 3 | 0 | 0 | **100%** |
| **Consolidated Total** | **9 Test Suites** | **40** | **40** | **0** | **0** | **100.0%** |

---

## 5. Detailed Test Case Specification Matrix

### 5.1 Form & Input Validation Tests (`ValidationWorkflowTest`)

| Test ID | Test Scenario | Target Input | Validation Rule Tested | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-VAL-REG-01** | Registration Blank Form | Empty values | Required on Name, Email, Phone, Password, Confirm, Terms | Displays 6 distinct error labels | **PASS** |
| **TC-VAL-REG-02** | Registration Name Format | `"A"`, `"John123#$"` | `minLength: 2`, `/^[a-zA-Z\s.'-]+$/` | Rejects single character and numeric/special characters | **PASS** |
| **TC-VAL-REG-03** | Registration Email Regex | `"plainaddress"`, `"user@domain"` | Email regex with valid domain and TLD | Blocks submission; displays invalid email message | **PASS** |
| **TC-VAL-REG-04** | Registration Phone Format | `"98765"`, `"1234567890"` | 10-digit mobile starting with 6, 7, 8, or 9 | Rejects short and invalid prefix phone numbers | **PASS** |
| **TC-VAL-REG-05** | Registration Password Complexity | `"Pass1!"`, `"Password123"` | `minLength: 8`, uppercase, lowercase, digit, special char | Flags short length and missing special character | **PASS** |
| **TC-VAL-REG-06** | Password Mismatch | `"StrongPass123!"` vs `"DifferentPass456!"` | Password equality validator | Displays `"Passwords do not match"` | **PASS** |
| **TC-VAL-REG-07** | Terms & Conditions Checkbox | Unchecked | `required: 'You must accept the terms & conditions'` | Displays terms acceptance error | **PASS** |
| **TC-VAL-LOG-01** | Login Empty Fields | `""`, `""` | Required email and password | Displays required validation labels | **PASS** |
| **TC-VAL-LOG-02** | Login Email Format | `"not-a-valid-email"` | Email regex validator | Displays invalid email error | **PASS** |
| **TC-VAL-FORGOT-01**| Forgot Password Email Validation | `""`, `"bad_email_format"` | Required and regex validation | Displays required and format error labels | **PASS** |
| **TC-VAL-PET-01** | Pet Registration Min Length | Name: `"A"`, Breed: `"B"` | Zod schema: `name.min(2)`, `breed.min(2)` | Form blocks submission with min length errors | **PASS** |
| **TC-VAL-PET-02** | Pet Registration Age/Weight Range | Age: `"-5"`, Weight: `"500"` | Zod schema: `age >= 0`, `weight <= 200` | Form highlights negative age and weight out of range | **PASS** |
| **TC-VAL-APPT-01** | Appointment Mandatory Fields | Unselected pet/doctor | Required selection on appointment form | Blocks blank booking; prompts doctor and pet selection | **PASS** |

### 5.2 System Workflows & Security Tests

| Test ID | Test Scenario | Target Role | Key Preconditions | Test Steps Summary | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Valid Login as Pet Owner | Pet Owner | App running; DB seeded | Input `owner@petverse.com`, valid password, click submit | Dashboard `/dashboard/owner` loads with user greeting | **PASS** |
| **TC-AUTH-02** | Invalid Login Displays Error Feedback | Unauthenticated | App running | Submit `nonexistent.user@example.com` / `WrongPassword999!` | Access denied; user remains on `/login`; error feedback shown | **PASS** |
| **TC-AUTH-03** | Logout Session Invalidation | Pet Owner | Authenticated session | Click Sign Out button in navigation sidebar | JWT cleared; redirect to `/login`; access to protected route blocked | **PASS** |
| **TC-AUTH-04** | Session Persistence on Refresh | Pet Owner | Authenticated session | Refresh browser via `driver.navigate().refresh()` | JWT retains session; user stays on `/dashboard/owner` | **PASS** |
| **TC-ADMIN-01** | Admin User Directory Access | Admin | Admin credentials | Login with `admin@petverse.com`; navigate to `/dashboard/admin/users` | Admin user directory renders registered account records | **PASS** |
| **TC-ADMIN-02** | Admin Filter User Directory | Admin | Admin on users page | Type `owner@petverse.com` into search filter | Table filters rows in real time matching target user | **PASS** |
| **TC-ADMIN-03** | Role Access Restriction (RBAC) | Pet Owner | Logged in as Owner | Attempt direct navigation to `/dashboard/admin/users` | Non-admin blocked and redirected away from admin routes | **PASS** |
| **TC-PET-01** | Owner Dashboard Overview Metrics | Pet Owner | Seeded pet owner account | Open owner overview page | "Total Pets Registered" card renders integer metric >= 0 | **PASS** |
| **TC-PET-02** | Pet Card & Permanent Pet ID | Pet Owner | Pets registered in DB | Navigate to "My Pets" tab | Pet cards display permanent badges (`PZ-PET-XXXXXX`) | **PASS** |
| **TC-PET-03** | Add Pet Negative Validation | Pet Owner | On My Pets tab | Open Add Pet modal and submit blank form | Client validation errors shown for required fields | **PASS** |
| **TC-PET-04** | Register New Pet & Verify Persistence | Pet Owner | On My Pets tab | Submit new pet form with dynamic name, reload page | Newly created pet persists in DOM after refresh | **PASS** |
| **TC-MED-01** | Access Pet Medical Records | Pet Owner | Authenticated owner | Navigate to "Medical Records" tab | Pet selector options, consultations, and vaccines visible | **PASS** |
| **TC-MED-02** | Anonymous Access Rejected | Anonymous | Cleared session storage | Direct navigation to `/dashboard/owner` | Redirected to `/login` | **PASS** |
| **TC-VET-01** | Appointment Booking Render | Pet Owner | Authenticated owner | Navigate to "Appointments" tab | Consultation form renders certified vet list and pet selector | **PASS** |
| **TC-VET-02** | Empty Appointment Validation | Pet Owner | On Appointments tab | Click submit with unselected fields | Form highlights required fields; prevents blank booking | **PASS** |
| **TC-VET-03** | Book Future Consultation Slot | Pet Owner | Certified vets available | Fill doctor, date, slot, reason, and submit | Booking workflow completes with confirmation feedback | **PASS** |
| **TC-REHOME-01**| Rehoming Board & Filter | Public / Any | Listings seeded in DB | Navigate to `/rehoming`; toggle Dog / Cat / All filters | Listings update reactively based on species filter | **PASS** |
| **TC-REHOME-02**| Rehoming Application Flow | Pet Owner | Authenticated user | Click "Apply to Adopt" on available listing | Rehoming application modal opens with contact form | **PASS** |
| **TC_LP_001** to **007** | Login Page Controls & Validations | Public | Standard UI | Inputs, placeholders, visibility toggle, route links, regex | All 7 validation rules and interactive controls verified | **PASS** |
| **PETID-01** | Permanent ID & Transfer Modal | Pet Owner | Authenticated owner | Inspect pet badge and click Transfer Ownership | Transfer modal explains continuous medical history retention | **PASS** |
| **PETID-02** | Vet Patient Lookup by Pet ID | Veterinarian | Seeded vet account | Login as `vet@petverse.com`, enter `PZ-PET-000001` in search | Verified patient chart banner and clinical history retrieved | **PASS** |

---

## 6. Page Object Model (POM) Architecture

```
backend/src/test/java/com/petzoe/api/selenium/
│
├── LoginPageTest.java                         # Form controls & unit validations
├── PetIdCentricSeleniumTest.java              # Pet ID lookup & transfer dialogs
│
└── workflow/
    ├── base/
    │   └── BaseTest.java                      # ChromeDriver lifecycle, headless config, screenshot hooks
    ├── pages/
    │   ├── RegisterPage.java                  # Registration form & input constraint locators
    │   ├── ForgotPasswordPage.java            # Password reset form & error locators
    │   ├── LoginPage.java                     # Auth form interaction & error toasts
    │   ├── OwnerDashboardPage.java            # Sidebar nav, overview metrics, sign out
    │   ├── PetManagementPage.java             # Pet cards, PZ-PET badges, add pet modal
    │   ├── MedicalRecordsPage.java            # Consultations & vaccination schedule
    │   ├── AppointmentPage.java               # Vet consultation booking workflow
    │   ├── RehomingBoardPage.java             # Public rehoming board & application modal
    │   └── AdminUsersPage.java                # Admin user directory & search
    ├── tests/
    │   ├── ValidationWorkflowTest.java        # TC-VAL-01 to TC-VAL-14 (Form & input validation suite)
    │   ├── AuthWorkflowTest.java              # TC-AUTH-01 to TC-AUTH-04
    │   ├── AdminWorkflowTest.java             # TC-ADMIN-01 to TC-ADMIN-03
    │   ├── PetManagementWorkflowTest.java     # TC-PET-01 to TC-PET-04
    │   ├── PetHealthWorkflowTest.java         # TC-MED-01 to TC-MED-02
    │   ├── AppointmentWorkflowTest.java       # TC-VET-01 to TC-VET-03
    │   └── RehomingWorkflowTest.java          # TC-REHOME-01 to TC-REHOME-02
    └── utils/
        ├── ScreenshotUtil.java                # Automatic PNG evidence generator
        └── TestData.java                      # Centralized seeded accounts & test values
```

---

## 7. Evidence Capture & Screenshot Repository

Validation screenshots generated into `test-results/screenshots/`:

| Test ID | Status | Generated Screenshot Artifact |
| :--- | :---: | :--- |
| **TC-VAL-REG-01** | PASS | `test-results/screenshots/TC-VAL-REG-01-PASS-20260918_114223.png` |
| **TC-VAL-REG-02** | PASS | `test-results/screenshots/TC-VAL-REG-02-PASS-20260918_114227.png` |
| **TC-VAL-REG-03** | PASS | `test-results/screenshots/TC-VAL-REG-03-PASS-20260918_114257.png` |
| **TC-VAL-REG-04** | PASS | `test-results/screenshots/TC-VAL-REG-04-PASS-20260918_114209.png` |
| **TC-VAL-REG-05** | PASS | `test-results/screenshots/TC-VAL-REG-05-PASS-20260918_114300.png` |
| **TC-VAL-REG-06** | PASS | `test-results/screenshots/TC-VAL-REG-06-PASS-20260918_114219.png` |
| **TC-VAL-REG-07** | PASS | `test-results/screenshots/TC-VAL-REG-07-PASS-20260918_114254.png` |
| **TC-VAL-LOG-01** | PASS | `test-results/screenshots/TC-VAL-LOG-01-PASS-20260918_114232.png` |
| **TC-VAL-LOG-02** | PASS | `test-results/screenshots/TC-VAL-LOG-02-PASS-20260918_114236.png` |
| **TC-VAL-FORGOT-01**| PASS | `test-results/screenshots/TC-VAL-FORGOT-01-PASS-20260918_114246.png` |
| **TC-VAL-PET-01** | PASS | `test-results/screenshots/TC-VAL-PET-01-PASS-20260918_114243.png` |
| **TC-VAL-PET-02** | PASS | `test-results/screenshots/TC-VAL-PET-02-PASS-20260918_114215.png` |
| **TC-VAL-APPT-01** | PASS | `test-results/screenshots/TC-VAL-APPT-01-PASS-20260918_114250.png` |

---

## 8. Replication Commands

### 8.1 Run Only the Form Validation Test Suite
```powershell
mvn test -Dtest=ValidationWorkflowTest
```

### 8.2 Run Complete Consolidated Selenium Test Suite (40 UI Tests)
```powershell
mvn test "-Dtest=ValidationWorkflowTest,AuthWorkflowTest,AdminWorkflowTest,PetManagementWorkflowTest,PetHealthWorkflowTest,AppointmentWorkflowTest,RehomingWorkflowTest,PetIdCentricSeleniumTest,LoginPageTest"
```

### 8.3 Run in Interactive Visual Browser Mode
```powershell
mvn test -Dtest=ValidationWorkflowTest -Dheadless=false
```

---

## 9. Conclusion & Quality Sign-Off

The automated validation and workflow testing cycle for the **PetZoe Digital Pet Healthcare & Veterinary Management System** has concluded with a **100% pass rate across all 40 Selenium UI & Validation tests and 19 Backend Service Integration tests (59 total tests)**.

All input constraints, data boundary checks, security guards, and functional lifecycles have been verified with complete test execution evidence.
