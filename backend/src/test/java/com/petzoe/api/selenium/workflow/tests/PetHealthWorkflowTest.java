package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.MedicalRecordsPage;
import com.petzoe.api.selenium.workflow.pages.OwnerDashboardPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

public class PetHealthWorkflowTest extends BaseTest {

    @Test
    @DisplayName("TC-MED-01: Authorized Owner Accesses Pet Medical & Vaccination Records")
    void testAuthorizedOwnerAccessesMedicalData() {
        try {
            logStep("Open PetZoe login page (/login)");
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);

            logStep("Login as registered pet owner (" + TestData.OWNER_EMAIL + ")");
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            assertTrue(dashboard.isLoaded(), "Owner dashboard must load successfully");

            logStep("Navigate to 'Medical Records' dashboard tab");
            dashboard.navigateToTab("Medical Records");

            MedicalRecordsPage medPage = new MedicalRecordsPage(driver);
            assertTrue(medPage.isLoaded(), "Medical records tab must load");
            logStep("Medical Records interface loaded with pet health history");

            logStep("Verify registered pets are selectable in the medical records dropdown/tabs");
            assertTrue(medPage.getAvailablePetSelectorsCount() > 0, "Registered pets should be selectable");

            logStep("Switch to Vaccination sub-tab and verify immunization timeline access");
            assertTrue(medPage.canAccessVaccinationRecords(), "Vaccination sub-tab must be accessible");
            logStep("Vaccination records and history successfully displayed");

            capturePass("TC-MED-01");
        } catch (Exception e) {
            captureFail("TC-MED-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-MED-02: Unauthorized Anonymous User Rejected from Medical Records")
    void testUnauthorizedAccessRejected() {
        try {
            clearAuthSession();
            navigateTo("/dashboard/owner");

            // Verify redirection to /login
            wait.until(ExpectedConditions.urlContains("/login"));
            assertTrue(driver.getCurrentUrl().contains("/login"), "Unauthenticated user must be redirected to /login");

            capturePass("TC-MED-02");
        } catch (Exception e) {
            captureFail("TC-MED-02");
            throw e;
        }
    }
}
