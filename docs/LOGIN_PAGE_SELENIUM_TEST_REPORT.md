# SOFTWARE TEST REPORT: LOGIN MODULE AUTOMATION TESTING
**Project Title:** PetZoe - Digital Pet Healthcare & Veterinary Management System  
**Module Name:** Authentication & Authorization (Login Page)  
**Testing Type:** Automated Functional & UI Testing  
**Tool / Framework:** Selenium WebDriver 4.19.1 + JUnit Jupiter (JUnit 5)  
**Execution Environment:** Google Chrome (Headless / Desktop Mode)  
**Date of Execution:** September 15, 2026  
**Status:** **PASSED (100%)**

---

## 1. Document Control & Overview

| Attribute | Details |
| :--- | :--- |
| **Document Version** | 1.0 |
| **Project** | PetZoe Web Application |
| **Tested Component** | `LoginPage.jsx` (`http://localhost:5173/login`) |
| **Test Suite Class** | `com.petzoe.api.selenium.LoginPageTest` |
| **Author / Tester** | Final Year Project Team |
| **Verified By** | Project Supervisor / QA Lead |

---

## 2. Testing Objectives & Scope

### 2.1 Objectives
1. Verify the integrity and responsiveness of all visual and interactive elements on the Login page.
2. Validate client-side input validation rules (blank fields, invalid email format) implemented via React Hook Form.
3. Validate user interaction controls, including the password visibility toggle and remember-me checkbox.
4. Verify routing integrity for navigation links (`/register` and `/forgot-password`).
5. Ensure graceful handling and user feedback upon submission with invalid credentials.

### 2.2 In-Scope
- Frontend UI components rendering.
- Client-side form validation mechanisms.
- Dynamic DOM attribute mutations (e.g. password input type `password` -> `text`).
- Client-side navigation via React Router DOM.
- Integration feedback with the backend authentication endpoint.

### 2.3 Out-of-Scope
- Third-party Google OAuth popup internal window lifecycle (handled via Google Identity Services).
- Database internal index optimization during authentication queries.

---

## 3. Test Environment & Technical Stack

| Component | Specification |
| :--- | :--- |
| **Operating System** | Windows 11 64-bit |
| **Client Frontend** | React 18, Vite 5, Tailwind CSS, React Hook Form, Lucide Icons |
| **Backend API** | Spring Boot 3.3.2, Spring Security 6, Java 21 / 25 |
| **Test Automation Tool** | Selenium WebDriver 4.19.1 (Java Binding) |
| **Test Runner** | JUnit Jupiter 5.10.x |
| **Build & Dependency Tool** | Apache Maven 3.9+ |
| **Browser Driver** | ChromeDriver (Auto-provisioned via Selenium Manager) |
| **Target Browser** | Google Chrome Version 152+ |
| **Base Application URL** | `http://localhost:5173/login` |

---

## 4. Test Execution Summary

```
-------------------------------------------------------------------------------
Test Set: com.petzoe.api.selenium.LoginPageTest
-------------------------------------------------------------------------------
Tests Run:       7
Failures:        0
Errors:          0
Skipped:         0
Time Elapsed:    29.52 seconds
Success Rate:    100%
Build Status:    BUILD SUCCESS
```

### Metrics Breakdown

| Total Tests | Passed | Failed | Errors | Skipped | Pass Percentage |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **7** | **7** | **0** | **0** | **0** | **100.0%** |

---

## 5. Detailed Test Case Specification Matrix

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data / Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_LP_001** | Verify UI Element Rendering & Placeholders | Application running on port 5173; Chrome driver initialized. | 1. Navigate to `/login`.<br/>2. Inspect heading, email, password, button, and links. | None | Page heading 'Welcome Back' visible; Email placeholder equals `owner@petverse.com`; All interactive controls visible. | All controls rendered correctly and placeholder verified. | **PASS** |
| **TC_LP_002** | Verify Empty Form Submission Validation | Login page loaded with empty input fields. | 1. Click 'Login to Account' button.<br/>2. Capture validation error labels. | Empty fields (`""`, `""`) | System blocks submit; displays `'Email address is required'` and `'Password is required'`. | Form submission aborted; both error labels rendered as expected. | **PASS** |
| **TC_LP_003** | Verify Email Format Regex Validation | Login page loaded. | 1. Input invalid email format.<br/>2. Click submit button.<br/>3. Verify error message. | Email: `"invalid-email-address"` | Form validation fails; displays `'Please enter a valid email address'`. | Validation error displayed with correct message. | **PASS** |
| **TC_LP_004** | Verify Password Visibility Toggle Functionality | Login page loaded with password field present. | 1. Verify default type is `'password'`.<br/>2. Click eye toggle icon.<br/>3. Verify type is `'text'`.<br/>4. Click toggle icon again. | None | Password input attribute switches between `'password'` and `'text'` dynamically. | Attribute mutated dynamically from `'password'` to `'text'` and back. | **PASS** |
| **TC_LP_005** | Verify Navigation to Registration Page | Login page loaded. | 1. Locate 'Register here' link.<br/>2. Click link.<br/>3. Verify target URL. | Click action | Browser URL transitions to `/register`; Register component renders. | Browser URL successfully navigated to `/register`. | **PASS** |
| **TC_LP_006** | Verify Navigation to Forgot Password Page | Login page loaded. | 1. Locate 'Forgot Password?' link.<br/>2. Click link.<br/>3. Verify target URL. | Click action | Browser URL transitions to `/forgot-password`. | Browser URL successfully navigated to `/forgot-password`. | **PASS** |
| **TC_LP_007** | Verify Invalid Credentials Handling | Backend and Frontend servers running. | 1. Enter non-registered email.<br/>2. Enter dummy password.<br/>3. Click submit button.<br/>4. Verify system response. | Email: `nonexistent.user@example.com`<br/>Password: `WrongPassword123!` | System denies access; keeps user on `/login`; shows error toast or verification status. | Access denied; user remained on `/login` without unauthorized redirect. | **PASS** |

---

## 6. Selenium Automation Implementation Details

### 6.1 WebDriver Initialization & Dynamic Wait Configuration
```java
@BeforeEach
void setUp() {
    ChromeOptions options = new ChromeOptions();
    boolean headless = Boolean.parseBoolean(System.getProperty("headless", "true"));
    if (headless) {
        options.addArguments("--headless=new");
    }
    options.addArguments("--window-size=1920,1080");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");

    driver = new ChromeDriver(options);
    wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    driver.get("http://localhost:5173/login");
}
```

### 6.2 Key Locator Mapping
- **Email Input:** `By.id("email")`
- **Password Input:** `By.id("password")`
- **Toggle Password Icon:** `By.xpath("//input[@id='password']/following-sibling::button")`
- **Submit Button:** `By.cssSelector("button[type='submit']")`
- **Validation Messages:** `By.xpath("//p[contains(text(), '...')]")`
- **Hyperlinks:** `By.linkText("Register here")`, `By.linkText("Forgot Password?")`

---

## 7. Execution Commands for Replication

### 7.1 Running in Headless Mode (Automated / CI Mode)
```bash
mvn test -Dtest=LoginPageTest
```

### 7.2 Running in Visual Mode (Interactive Desktop Browser)
```bash
mvn test -Dtest=LoginPageTest -Dheadless=false
```

---

## 8. Defect & Anomaly Log
No critical, major, or minor defects were discovered during this execution cycle. All client-side validation rules and navigation handlers operated in strict accordance with the software requirements specification (SRS).

---

## 9. Conclusion
The automated test execution of the **PetZoe Authentication (Login) Module** via Selenium WebDriver completed successfully with a **100% pass rate** across all critical functional paths. The page demonstrates robust error handling, reliable input validation, and expected user redirection.
