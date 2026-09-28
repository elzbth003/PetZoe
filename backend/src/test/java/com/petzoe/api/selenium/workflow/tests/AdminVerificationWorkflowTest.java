package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.AdminVerificationPage;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

public class AdminVerificationWorkflowTest extends BaseTest {

    private void loginAsAdmin() {
        logStep("Open PetZoe login page (/login)");
        navigateTo("/login");
        LoginPage loginPage = new LoginPage(driver);

        logStep("Enter System Administrator credentials (" + TestData.ADMIN_EMAIL + ")");
        loginPage.login(TestData.ADMIN_EMAIL, TestData.ADMIN_PASSWORD);

        logStep("Verify successful login and redirection to Admin Dashboard");
        wait.until(ExpectedConditions.urlContains("/dashboard/admin"));
    }

    @Test
    @DisplayName("TC-ADMIN-04: Admin Veterinarian Verification Registry & Status Filtering")
    void testAdminVeterinarianManagementRegistry() {
        try {
            loginAsAdmin();

            logStep("Navigate to Veterinarian Management registry (/dashboard/admin/veterinarians)");
            navigateTo("/dashboard/admin/veterinarians");

            AdminVerificationPage page = new AdminVerificationPage(driver);
            assertTrue(page.isVetManagementLoaded(), "Veterinarian management console should load");

            logStep("Verify registered veterinarians table is populated with records");
            assertTrue(page.getVetRowsCount() > 0, "Veterinarians table must display records");

            logStep("Verify pre-seeded veterinarian Dr. Sarah Jenkins is listed");
            assertTrue(page.hasVetRowWithEmail("vet@petverse.com"), "Dr. Sarah Jenkins should be listed");

            capturePass("TC-ADMIN-04");
        } catch (Exception e) {
            captureFail("TC-ADMIN-04");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-ADMIN-05: Admin Shelter Verification Review & Supporting Documents Inspection")
    void testAdminShelterVerificationReview() {
        try {
            loginAsAdmin();

            logStep("Navigate to Shelter Verification console (/dashboard/admin/shelters)");
            navigateTo("/dashboard/admin/shelters");

            AdminVerificationPage page = new AdminVerificationPage(driver);
            assertTrue(page.isShelterVerificationLoaded(), "Shelter verification console should load");

            logStep("Verify shelters list is populated");
            assertTrue(page.getShelterCardsCount() > 0, "Shelter cards list must contain registered shelters");

            logStep("Filter by 'ALL' to view all shelters");
            page.filterSheltersBy("ALL");

            logStep("Inspect details for 'Paws & Hope Animal Sanctuary'");
            page.selectShelter("Paws & Hope");

            logStep("Verify shelter detail view and documents section are rendered");
            assertTrue(page.isShelterDetailOpen(), "Shelter detail review panel must open upon selection");

            capturePass("TC-ADMIN-05");
        } catch (Exception e) {
            captureFail("TC-ADMIN-05");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-ADMIN-06: Admin Marketplace Product Moderation Review Queue")
    void testAdminProductModerationQueue() {
        try {
            loginAsAdmin();

            logStep("Navigate to Product Moderation console (/dashboard/admin/products)");
            navigateTo("/dashboard/admin/products");

            AdminVerificationPage page = new AdminVerificationPage(driver);
            assertTrue(page.isProductModerationLoaded(), "Product moderation console should load");

            capturePass("TC-ADMIN-06");
        } catch (Exception e) {
            captureFail("TC-ADMIN-06");
            throw e;
        }
    }
}
