package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.AppointmentPage;
import com.petzoe.api.selenium.workflow.pages.ForgotPasswordPage;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.OwnerDashboardPage;
import com.petzoe.api.selenium.workflow.pages.PetManagementPage;
import com.petzoe.api.selenium.workflow.pages.RegisterPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive Automated Selenium UI & Form Validation Test Suite.
 * Validates:
 * - Client-side form constraints (React Hook Form / Zod)
 * - Required field indicators & blank submissions
 * - Pattern regexes (Email, Phone, Names)
 * - Boundary values (Password lengths, Pet Age, Pet Weight)
 * - Dynamic mismatch and checkbox acceptance guards
 */
public class ValidationWorkflowTest extends BaseTest {

    // ==========================================
    // 1. REGISTRATION FORM VALIDATIONS
    // ==========================================

    @Test
    @DisplayName("TC-VAL-REG-01: Registration Form - Blank Submission Triggers All Required Errors")
    void testRegisterBlankFormValidation() {
        try {
            navigateTo("/register");
            RegisterPage registerPage = new RegisterPage(driver);
            assertTrue(registerPage.isLoaded(), "Registration page should be loaded");

            registerPage.submitForm();

            assertTrue(registerPage.hasNameError(), "Name required error should be displayed");
            assertTrue(registerPage.hasEmailError(), "Email required error should be displayed");
            assertTrue(registerPage.hasPhoneError(), "Phone required error should be displayed");
            assertTrue(registerPage.hasPasswordError(), "Password required error should be displayed");
            assertTrue(registerPage.hasConfirmPasswordError(), "Confirm password required error should be displayed");
            assertTrue(registerPage.hasTermsError(), "Terms acceptance error should be displayed");

            capturePass("TC-VAL-REG-01");
        } catch (Exception e) {
            captureFail("TC-VAL-REG-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VAL-REG-02: Registration Form - Invalid Name Character & Length Validation")
    void testRegisterNameValidation() {
        try {
            navigateTo("/register");
            RegisterPage registerPage = new RegisterPage(driver);
            assertTrue(registerPage.isLoaded());

            // 1. Single character name (violates minLength: 2)
            registerPage.fillName("A");
            registerPage.submitForm();
            assertTrue(registerPage.hasNameError(), "Single character name must trigger minLength validation");

            // 2. Name with numbers and special symbols (violates name regex)
            registerPage.fillName("John123#$");
            registerPage.submitForm();
            assertTrue(registerPage.hasNameError(), "Numeric/special characters in name must trigger validation");

            capturePass("TC-VAL-REG-02");
        } catch (Exception e) {
            captureFail("TC-VAL-REG-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VAL-REG-03: Registration Form - Email Format Regex Validation")
    void testRegisterEmailFormatValidation() {
        try {
            navigateTo("/register");
            RegisterPage registerPage = new RegisterPage(driver);
            assertTrue(registerPage.isLoaded());

            // Invalid email missing '@' and domain
            registerPage.fillEmail("plainaddress");
            registerPage.submitForm();
            assertTrue(registerPage.hasEmailError(), "Malformed email without @ must be flagged as invalid");

            // Invalid email missing top-level domain
            registerPage.fillEmail("user@domain");
            registerPage.submitForm();
            assertTrue(registerPage.hasEmailError(), "Email missing TLD must be flagged as invalid");

            capturePass("TC-VAL-REG-03");
        } catch (Exception e) {
            captureFail("TC-VAL-REG-03");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VAL-REG-04: Registration Form - Phone Number 10-Digit & Prefix Validation")
    void testRegisterPhoneValidation() {
        try {
            navigateTo("/register");
            RegisterPage registerPage = new RegisterPage(driver);
            assertTrue(registerPage.isLoaded());

            // Insufficient digits
            registerPage.fillPhone("98765");
            registerPage.submitForm();
            assertTrue(registerPage.hasPhoneError(), "Phone with less than 10 digits must fail validation");

            // Invalid starting digit (must start with 6, 7, 8, or 9)
            registerPage.fillPhone("1234567890");
            registerPage.submitForm();
            assertTrue(registerPage.hasPhoneError(), "Phone starting with 1 must fail Indian mobile regex");

            capturePass("TC-VAL-REG-04");
        } catch (Exception e) {
            captureFail("TC-VAL-REG-04");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VAL-REG-05: Registration Form - Password Complexity & Length Validation")
    void testRegisterPasswordComplexityValidation() {
        try {
            navigateTo("/register");
            RegisterPage registerPage = new RegisterPage(driver);
            assertTrue(registerPage.isLoaded());

            // Short password (< 8 chars)
            registerPage.fillPassword("Pass1!");
            registerPage.submitForm();
            assertTrue(registerPage.hasPasswordError(), "Password shorter than 8 characters must fail validation");

            // Missing special character
            registerPage.fillPassword("Password123");
            registerPage.submitForm();
            assertTrue(registerPage.hasPasswordError(), "Password missing special symbol must fail complexity check");

            capturePass("TC-VAL-REG-05");
        } catch (Exception e) {
            captureFail("TC-VAL-REG-05");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VAL-REG-06: Registration Form - Password and Confirm Password Mismatch")
    void testRegisterPasswordMismatchValidation() {
        try {
            navigateTo("/register");
            RegisterPage registerPage = new RegisterPage(driver);
            assertTrue(registerPage.isLoaded());

            registerPage.fillPassword("StrongPass123!");
            registerPage.fillConfirmPassword("DifferentPass456!");
            registerPage.submitForm();

            assertTrue(registerPage.hasConfirmPasswordError(), "Password mismatch must show 'Passwords do not match'");

            capturePass("TC-VAL-REG-06");
        } catch (Exception e) {
            captureFail("TC-VAL-REG-06");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VAL-REG-07: Registration Form - Mandatory Terms Checkbox Validation")
    void testRegisterTermsValidation() {
        try {
            navigateTo("/register");
            RegisterPage registerPage = new RegisterPage(driver);
            assertTrue(registerPage.isLoaded());

            registerPage.fillName("Test User");
            registerPage.fillEmail("valid.user@petverse.com");
            registerPage.fillPhone("9876543210");
            registerPage.fillPassword("StrongPass123!");
            registerPage.fillConfirmPassword("StrongPass123!");
            registerPage.toggleTermsCheckbox(false);

            registerPage.submitForm();
            assertTrue(registerPage.hasTermsError(), "Submitting with unchecked terms must trigger acceptance error");

            capturePass("TC-VAL-REG-07");
        } catch (Exception e) {
            captureFail("TC-VAL-REG-07");
            throw e;
        }
    }

    // ==========================================
    // 2. LOGIN FORM VALIDATIONS
    // ==========================================

    @Test
    @DisplayName("TC-VAL-LOG-01: Login Form - Empty Submission Displays Required Errors")
    void testLoginEmptyFieldsValidation() {
        try {
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            assertTrue(loginPage.isLoaded());

            loginPage.login("", "");
            assertTrue(loginPage.hasEmailError(), "Login must display email required message on blank submit");
            assertTrue(loginPage.hasPasswordError(), "Login must display password required message on blank submit");

            capturePass("TC-VAL-LOG-01");
        } catch (Exception e) {
            captureFail("TC-VAL-LOG-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VAL-LOG-02: Login Form - Invalid Email Regex Format Validation")
    void testLoginEmailRegexValidation() {
        try {
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            assertTrue(loginPage.isLoaded());

            loginPage.login("not-a-valid-email", "Password123!");
            assertTrue(loginPage.hasEmailError(), "Malformed email format must trigger regex validation message");

            capturePass("TC-VAL-LOG-02");
        } catch (Exception e) {
            captureFail("TC-VAL-LOG-02");
            throw e;
        }
    }

    // ==========================================
    // 3. FORGOT PASSWORD VALIDATIONS
    // ==========================================

    @Test
    @DisplayName("TC-VAL-FORGOT-01: Forgot Password - Blank and Invalid Email Validation")
    void testForgotPasswordValidation() {
        try {
            navigateTo("/forgot-password");
            ForgotPasswordPage forgotPage = new ForgotPasswordPage(driver);
            assertTrue(forgotPage.isLoaded(), "Forgot Password page should be loaded");

            // Blank submit
            forgotPage.submitEmpty();
            assertTrue(forgotPage.hasEmailError(), "Blank email submit must show required validation");

            // Invalid format
            forgotPage.submitEmail("bad_email_format");
            assertTrue(forgotPage.hasEmailError(), "Invalid email format must trigger validation message");

            capturePass("TC-VAL-FORGOT-01");
        } catch (Exception e) {
            captureFail("TC-VAL-FORGOT-01");
            throw e;
        }
    }

    // ==========================================
    // 4. PET REGISTRATION MODAL VALIDATIONS
    // ==========================================

    @Test
    @DisplayName("TC-VAL-PET-01: Pet Registration - Minimum Length for Name & Breed")
    void testPetRegistrationMinLengthValidation() {
        try {
            // Login as Owner
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            assertTrue(dashboard.isLoaded());
            dashboard.navigateToTab("My Pets");

            PetManagementPage petPage = new PetManagementPage(driver);
            petPage.openAddPetModal();

            // Single character name (violates Zod min 2)
            petPage.fillPetFields("A", "B", "2", "10");
            petPage.clickRegisterButton();

            assertTrue(petPage.hasValidationErrors(), "Pet name and breed shorter than 2 chars must trigger validation");

            capturePass("TC-VAL-PET-01");
        } catch (Exception e) {
            captureFail("TC-VAL-PET-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VAL-PET-02: Pet Registration - Out-of-Range Age & Weight Validation")
    void testPetRegistrationRangeValidation() {
        try {
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            assertTrue(dashboard.isLoaded());
            dashboard.navigateToTab("My Pets");

            PetManagementPage petPage = new PetManagementPage(driver);
            petPage.openAddPetModal();

            // Negative age and excessive weight (> 200 kg)
            petPage.fillPetFields("Valid Name", "Golden Retriever", "-5", "500");
            petPage.clickRegisterButton();

            assertTrue(petPage.hasValidationErrors(), "Negative age or excessive weight must trigger validation");

            capturePass("TC-VAL-PET-02");
        } catch (Exception e) {
            captureFail("TC-VAL-PET-02");
            throw e;
        }
    }

    // ==========================================
    // 5. APPOINTMENT BOOKING FORM VALIDATIONS
    // ==========================================

    @Test
    @DisplayName("TC-VAL-APPT-01: Appointment Booking - Unselected Doctor and Date Validation")
    void testAppointmentMandatoryFieldsValidation() {
        try {
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            assertTrue(dashboard.isLoaded());
            dashboard.navigateToTab("Appointments");

            AppointmentPage apptPage = new AppointmentPage(driver);
            assertTrue(apptPage.isLoaded());

            apptPage.submitEmptyForm();
            assertTrue(apptPage.hasValidationErrors(), "Appointment form with unselected doctor or date must block submission");

            capturePass("TC-VAL-APPT-01");
        } catch (Exception e) {
            captureFail("TC-VAL-APPT-01");
            throw e;
        }
    }
}
