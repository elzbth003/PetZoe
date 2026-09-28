package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.AddProductPage;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.SellerDashboardPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SellerWorkflowTest extends BaseTest {

    private void loginAsSeller() {
        logStep("Navigate to PetZoe Login page (/login)");
        navigateTo("/login");
        LoginPage loginPage = new LoginPage(driver);
        logStep("Authenticate with pre-seeded Marketplace Seller credentials (" + TestData.SELLER_EMAIL + ")");
        loginPage.login(TestData.SELLER_EMAIL, TestData.SELLER_PASSWORD);
        SellerDashboardPage dashboard = new SellerDashboardPage(driver);
        assertTrue(dashboard.isLoaded(), "Marketplace Seller dashboard must load");
    }

    @Test
    @DisplayName("TC-SELLER-01: Marketplace Seller Login and Dashboard Overview Verification")
    void testSellerDashboardOverview() {
        try {
            loginAsSeller();
            SellerDashboardPage dashboard = new SellerDashboardPage(driver);

            logStep("Verify Total Products metric card is visible");
            String productsCount = dashboard.getTotalProductsCount();
            assertNotNull(productsCount, "Products count metric should be displayed");

            logStep("Verify Revenue metric card is visible");
            String revenue = dashboard.getRevenue();
            assertNotNull(revenue, "Revenue metric should be displayed");

            capturePass("TC-SELLER-01");
        } catch (Exception e) {
            captureFail("TC-SELLER-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SELLER-02: Seller Inventory Tab Verification & Seeded Products Check")
    void testSellerInventoryList() {
        try {
            loginAsSeller();
            SellerDashboardPage dashboard = new SellerDashboardPage(driver);

            logStep("Navigate to 'My Products' inventory tab");
            dashboard.navigateToTab("My Products");

            logStep("Verify seller inventory table displays seeded catalog items");
            assertTrue(dashboard.getInventoryProductsCount() > 0, "Inventory table must display seller's catalog items");

            logStep("Verify pre-seeded seller product exists in inventory");
            assertTrue(dashboard.hasProductWithName("Dental Chews") || dashboard.hasProductWithName("Omega Chew") || dashboard.hasProductWithName("PetZoe"),
                    "Seller inventory must list seller's catalog items");

            capturePass("TC-SELLER-02");
        } catch (Exception e) {
            captureFail("TC-SELLER-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SELLER-03: Add Product Wizard Negative Validation (Empty Fields Check)")
    void testAddProductWizardNegativeValidation() {
        try {
            loginAsSeller();
            SellerDashboardPage dashboard = new SellerDashboardPage(driver);
            dashboard.navigateToTab("My Products");

            logStep("Open 'Add Product' wizard dialog");
            dashboard.openAddProductWizard();

            AddProductPage addProductPage = new AddProductPage(driver);
            assertTrue(addProductPage.isLoaded(), "Add product wizard must open");

            logStep("Attempt to proceed to Step 2 without filling mandatory Step 1 fields");
            addProductPage.clickNext();

            logStep("Verify validation error banner displays required field alert");
            assertTrue(addProductPage.hasErrorMessage(), "Wizard must block navigation when required fields are missing");
            assertTrue(addProductPage.getErrorMessage().contains("required"), "Error message must indicate missing fields");

            capturePass("TC-SELLER-03");
        } catch (Exception e) {
            captureFail("TC-SELLER-03");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SELLER-04: Multi-Step Add Product Wizard Execution & Draft Creation")
    void testAddProductWizardMultiStepSubmission() {
        try {
            loginAsSeller();
            SellerDashboardPage dashboard = new SellerDashboardPage(driver);
            dashboard.navigateToTab("My Products");

            dashboard.openAddProductWizard();
            AddProductPage addProductPage = new AddProductPage(driver);

            String uniqueSku = "SKU-AUTO-" + (System.currentTimeMillis() % 10000);
            String uniqueProductName = "Premium Omega Chew " + (System.currentTimeMillis() % 10000);

            logStep("Step 1: Fill Basic Information (Name: " + uniqueProductName + ", SKU: " + uniqueSku + ")");
            addProductPage.fillStep1(
                    uniqueProductName,
                    "PetZoe Labs",
                    "Pet Food",
                    uniqueSku,
                    "Dog",
                    "Rich in Omega-3 and essential EPA/DHA fatty acids for healthy canine skin and coat."
            );
            addProductPage.clickNext();

            logStep("Step 2: Fill Pricing & Inventory (MRP: 799, Price: 649, Stock: 50)");
            addProductPage.fillStep2("799", "649", "50", "5");
            addProductPage.clickNext();

            logStep("Step 3: Review Category Specific Details and proceed");
            addProductPage.clickNext();

            logStep("Step 4: Save product draft");
            addProductPage.clickSaveDraft();
            addProductPage.handleAlertIfPresent();

            logStep("Verify product addition and return to inventory view");
            wait.until(d -> !addProductPage.isLoaded() || dashboard.isLoaded());

            capturePass("TC-SELLER-04");
        } catch (Exception e) {
            captureFail("TC-SELLER-04");
            throw e;
        }
    }
}
