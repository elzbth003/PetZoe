package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.OwnerDashboardPage;
import com.petzoe.api.selenium.workflow.pages.PetManagementPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PetManagementWorkflowTest extends BaseTest {

    private void loginAsOwner() {
        navigateTo("/login");
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);
        OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
        assertTrue(dashboard.isLoaded(), "Owner dashboard must load");
    }

    @Test
    @DisplayName("TC-PET-01: Verify Pet Owner Dashboard Overview Metrics")
    void testOwnerDashboardPetMetrics() {
        try {
            logStep("Login to PetZoe as registered Pet Owner");
            loginAsOwner();
            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);

            logStep("Retrieve 'Total Pets Registered' metric counter from dashboard overview cards");
            String petsCount = dashboard.getTotalPetsRegistered();
            assertNotNull(petsCount, "Total Pets metric should be displayed");
            assertTrue(Integer.parseInt(petsCount) >= 0, "Registered pets count should be non-negative");
            logStep("Verified dashboard displays registered pets metric: " + petsCount);

            capturePass("TC-PET-01");
        } catch (Exception e) {
            captureFail("TC-PET-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-PET-02: Open Pet List & Verify Permanent Pet ID Badges")
    void testPetListAndPermanentPetIds() {
        try {
            loginAsOwner();
            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            dashboard.navigateToTab("My Pets");

            PetManagementPage petPage = new PetManagementPage(driver);
            assertTrue(petPage.isLoaded(), "My Pets tab should be loaded");
            assertTrue(petPage.getPetCardsCount() > 0, "Seeded pet cards should be displayed with PZ-PET badges");

            capturePass("TC-PET-02");
        } catch (Exception e) {
            captureFail("TC-PET-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-PET-03: Add Pet Form Negative Validation (Blank Fields)")
    void testAddPetNegativeValidation() {
        try {
            loginAsOwner();
            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            dashboard.navigateToTab("My Pets");

            PetManagementPage petPage = new PetManagementPage(driver);
            petPage.openAddPetModal();
            petPage.submitEmptyPetForm();

            assertTrue(petPage.hasValidationErrors(), "Form submission with empty fields must show validation errors");

            capturePass("TC-PET-03");
        } catch (Exception e) {
            captureFail("TC-PET-03");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-PET-04: Successfully Register New Pet and Verify Persistence")
    void testRegisterNewPetAndPersistence() {
        try {
            logStep("Login to PetZoe as Pet Owner");
            loginAsOwner();
            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);

            logStep("Navigate to 'My Pets' management tab");
            dashboard.navigateToTab("My Pets");

            PetManagementPage petPage = new PetManagementPage(driver);
            logStep("Open 'Add Pet' registration dialog modal");
            petPage.openAddPetModal();
            
            String uniquePetName = "AutoTest " + (System.currentTimeMillis() % 10000);
            logStep("Fill pet registration form (Name: " + uniquePetName + ", Species: Dog, Breed: Labrador Retriever)");
            petPage.fillAndSubmitPet(uniquePetName, "Dog", "Labrador Retriever", "2", "Male", "24.5", "Up-to-date");
            logStep("Submitted pet creation form");

            logStep("Refresh browser window to test backend database persistence");
            driver.navigate().refresh();
            dashboard.navigateToTab("My Pets");

            logStep("Verify registered pet '" + uniquePetName + "' is displayed in the pet cards list");
            assertTrue(petPage.hasPetWithName(uniquePetName), "Newly registered pet should persist after page reload");
            logStep("Pet '" + uniquePetName + "' successfully persisted and verified");

            capturePass("TC-PET-04");
        } catch (Exception e) {
            captureFail("TC-PET-04");
            throw e;
        }
    }
}
