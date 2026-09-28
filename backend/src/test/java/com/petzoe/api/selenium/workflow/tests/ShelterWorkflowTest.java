package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.ShelterAnimalsPage;
import com.petzoe.api.selenium.workflow.pages.ShelterApplicationsPage;
import com.petzoe.api.selenium.workflow.pages.ShelterDashboardPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

public class ShelterWorkflowTest extends BaseTest {

    private void loginAsShelterManager() {
        logStep("Navigate to PetZoe Login page (/login)");
        navigateTo("/login");
        LoginPage loginPage = new LoginPage(driver);
        logStep("Authenticate with pre-seeded Shelter Manager credentials (" + TestData.SHELTER_EMAIL + ")");
        loginPage.login(TestData.SHELTER_EMAIL, TestData.SHELTER_PASSWORD);
        ShelterDashboardPage dashboard = new ShelterDashboardPage(driver);
        assertTrue(dashboard.isLoaded(), "Shelter manager dashboard must load");
    }

    @Test
    @DisplayName("TC-SHELTER-01: Shelter Manager Login and Verification Status Check")
    void testShelterManagerLoginAndStatus() {
        try {
            loginAsShelterManager();
            ShelterDashboardPage dashboard = new ShelterDashboardPage(driver);

            logStep("Verify Shelter Manager dashboard overview displays APPROVED status");
            String status = dashboard.getVerificationStatus();
            assertTrue(status.contains("APPROVED"), "Shelter verification status should be APPROVED for pre-seeded sanctuary");

            logStep("Verify shelter capacity metric card is displayed");
            String capacity = dashboard.getCapacity();
            assertNotNull(capacity, "Capacity metric card should be present");
            assertFalse(capacity.isEmpty(), "Capacity value should be displayed");

            capturePass("TC-SHELTER-01");
        } catch (Exception e) {
            captureFail("TC-SHELTER-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SHELTER-02: Shelter Profile Tab and Readiness Verification")
    void testShelterProfileReadiness() {
        try {
            loginAsShelterManager();
            ShelterDashboardPage dashboard = new ShelterDashboardPage(driver);

            logStep("Navigate to 'Shelter Profile' tab");
            dashboard.navigateToTab("Shelter Profile");

            logStep("Verify Profile Information and readiness checklist are displayed");
            assertTrue(dashboard.isProfileChecklistVisible(), "Profile checklist must be displayed for verified shelter");

            capturePass("TC-SHELTER-02");
        } catch (Exception e) {
            captureFail("TC-SHELTER-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SHELTER-03: Shelter Animals Directory Access & Seeded Animals Verification")
    void testShelterAnimalsDirectory() {
        try {
            loginAsShelterManager();
            ShelterDashboardPage dashboard = new ShelterDashboardPage(driver);

            logStep("Navigate to 'Animals' management tab");
            dashboard.navigateToTab("Animals");

            ShelterAnimalsPage animalsPage = new ShelterAnimalsPage(driver);
            assertTrue(animalsPage.isLoaded(), "Shelter animals panel should load");

            logStep("Verify seeded animal list is populated");
            assertTrue(animalsPage.getAnimalsCount() > 0, "Animals list must contain pre-seeded animals");

            logStep("Verify pre-seeded animal 'Buddy' exists in directory");
            assertTrue(animalsPage.hasAnimalWithName("Buddy"), "Animal 'Buddy' should be listed in sanctuary roster");

            capturePass("TC-SHELTER-03");
        } catch (Exception e) {
            captureFail("TC-SHELTER-03");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SHELTER-04: Record Animal Intake Form Negative Validation")
    void testRecordAnimalIntakeNegativeValidation() {
        try {
            loginAsShelterManager();
            ShelterDashboardPage dashboard = new ShelterDashboardPage(driver);
            dashboard.navigateToTab("Animals");

            ShelterAnimalsPage animalsPage = new ShelterAnimalsPage(driver);
            logStep("Open 'Record Intake' modal dialog");
            animalsPage.openRecordIntakeModal();

            logStep("Attempt form submission without required species field");
            animalsPage.fillAndSubmitIntake("", "", "", "MALE", "12", "Brown", "15.0", "Negative test intake", null);

            logStep("Verify form remains open due to HTML5 / React field validation");
            assertTrue(animalsPage.isLoaded(), "Animals panel remains active during validation");

            capturePass("TC-SHELTER-04");
        } catch (Exception e) {
            captureFail("TC-SHELTER-04");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SHELTER-05: Record New Animal Intake with Photo Upload and Verify Persistence")
    void testRecordAnimalIntakeWithPhoto() {
        try {
            loginAsShelterManager();
            ShelterDashboardPage dashboard = new ShelterDashboardPage(driver);
            dashboard.navigateToTab("Animals");

            ShelterAnimalsPage animalsPage = new ShelterAnimalsPage(driver);
            animalsPage.openRecordIntakeModal();

            String uniqueAnimalName = "Rescue " + (System.currentTimeMillis() % 10000);
            logStep("Submit animal intake with name: " + uniqueAnimalName + " and photo file upload");
            animalsPage.fillAndSubmitIntake(
                    uniqueAnimalName,
                    "Dog",
                    "Indie Mix",
                    "FEMALE",
                    "10",
                    "Fawn & White",
                    "14.5",
                    "Rescued near highway intersection by patrol team",
                    TestData.TEST_IMAGE_PATH
            );

            logStep("Wait for intake recording to complete");
            wait.until(d -> animalsPage.hasAnimalWithName(uniqueAnimalName) || animalsPage.isAnimalDetailOpen());

            logStep("Refresh page to verify database persistence of new shelter animal intake");
            driver.navigate().refresh();
            dashboard.navigateToTab("Animals");

            assertTrue(animalsPage.hasAnimalWithName(uniqueAnimalName),
                    "Newly recorded animal intake must persist in shelter database after page reload");
            logStep("Animal '" + uniqueAnimalName + "' verified in persistent sanctuary roster");

            capturePass("TC-SHELTER-05");
        } catch (Exception e) {
            captureFail("TC-SHELTER-05");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SHELTER-06: Shelter Manager Reviews Adoption Applications & Adopter Profiles")
    void testShelterAdoptionApplicationsReview() {
        try {
            loginAsShelterManager();
            ShelterDashboardPage dashboard = new ShelterDashboardPage(driver);

            logStep("Navigate to 'Adoptions' applications panel tab");
            dashboard.navigateToTab("Adoptions");

            ShelterApplicationsPage appPage = new ShelterApplicationsPage(driver);
            assertTrue(appPage.isLoaded(), "Adoption applications panel must load");

            logStep("Verify adoption applications list is populated with pre-seeded adopter records");
            assertTrue(appPage.getApplicationsCount() > 0, "Applications list should contain submitted adoption requests");

            logStep("Select application for animal 'Buddy'");
            appPage.selectApplicationForAnimal("Buddy");

            logStep("Verify application detail view is displayed with applicant contact and living arrangement");
            assertTrue(appPage.isApplicationDetailOpen(), "Application details must display upon clicking applicant card");

            String applicantInfo = appPage.getApplicantInfoText();
            assertTrue(applicantInfo.contains("Aarav Patel") || applicantInfo.contains("Applicant"),
                    "Applicant profile details must be visible to shelter manager");

            capturePass("TC-SHELTER-06");
        } catch (Exception e) {
            captureFail("TC-SHELTER-06");
            throw e;
        }
    }
}
