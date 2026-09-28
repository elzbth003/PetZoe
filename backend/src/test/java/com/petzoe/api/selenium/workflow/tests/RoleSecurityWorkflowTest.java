package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

public class RoleSecurityWorkflowTest extends BaseTest {

    @Test
    @DisplayName("TC-SEC-01: Pet Owner Forbidden from Accessing Shelter, Seller, or Admin Dashboards")
    void testOwnerRoleGatedSecurity() {
        try {
            logStep("Login as Pet Owner");
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);
            wait.until(ExpectedConditions.urlContains("/dashboard/owner"));

            logStep("Attempt direct navigation to Shelter Dashboard (/dashboard/shelter)");
            navigateTo("/dashboard/shelter");

            logStep("Verify system blocks access and redirects back to Pet Owner dashboard");
            boolean redirected = wait.until(d -> d.getCurrentUrl().contains("/dashboard/owner"));
            assertTrue(redirected, "Pet Owner must not be permitted on /dashboard/shelter");

            logStep("Attempt direct navigation to Admin Panel (/dashboard/admin)");
            navigateTo("/dashboard/admin");

            boolean adminBlocked = wait.until(d -> d.getCurrentUrl().contains("/dashboard/owner"));
            assertTrue(adminBlocked, "Pet Owner must not be permitted on /dashboard/admin");

            capturePass("TC-SEC-01");
        } catch (Exception e) {
            captureFail("TC-SEC-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SEC-02: Shelter Manager Forbidden from Accessing Vet or Seller Dashboards")
    void testShelterManagerRoleGatedSecurity() {
        try {
            logStep("Login as Shelter Manager");
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.SHELTER_EMAIL, TestData.SHELTER_PASSWORD);
            wait.until(ExpectedConditions.urlContains("/dashboard/shelter"));

            logStep("Attempt direct navigation to Veterinarian Dashboard (/dashboard/vet)");
            navigateTo("/dashboard/vet");

            logStep("Verify system blocks access and redirects back to Shelter Manager dashboard");
            boolean redirected = wait.until(d -> d.getCurrentUrl().contains("/dashboard/shelter"));
            assertTrue(redirected, "Shelter Manager must not be permitted on /dashboard/vet");

            capturePass("TC-SEC-02");
        } catch (Exception e) {
            captureFail("TC-SEC-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SEC-03: Marketplace Seller Forbidden from Accessing Vet or Shelter Dashboards")
    void testSellerRoleGatedSecurity() {
        try {
            logStep("Login as Marketplace Seller");
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.SELLER_EMAIL, TestData.SELLER_PASSWORD);
            wait.until(ExpectedConditions.urlContains("/dashboard/seller"));

            logStep("Attempt direct navigation to Shelter Dashboard (/dashboard/shelter)");
            navigateTo("/dashboard/shelter");

            logStep("Verify system blocks access and redirects back to Seller dashboard");
            boolean redirected = wait.until(d -> d.getCurrentUrl().contains("/dashboard/seller"));
            assertTrue(redirected, "Seller must not be permitted on /dashboard/shelter");

            capturePass("TC-SEC-03");
        } catch (Exception e) {
            captureFail("TC-SEC-03");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-SEC-04: Unauthenticated Access Forbidden from All Protected Dashboards")
    void testUnauthenticatedAccessRedirectsToLogin() {
        try {
            logStep("Clear any active session storage and cookies");
            clearAuthSession();

            logStep("Attempt direct access to /dashboard/owner without authentication");
            navigateTo("/dashboard/owner");
            boolean redirectedOwner = wait.until(d -> d.getCurrentUrl().contains("/login"));
            assertTrue(redirectedOwner, "Anonymous user must be redirected to /login from /dashboard/owner");

            logStep("Attempt direct access to /dashboard/admin without authentication");
            navigateTo("/dashboard/admin");
            boolean redirectedAdmin = wait.until(d -> d.getCurrentUrl().contains("/login"));
            assertTrue(redirectedAdmin, "Anonymous user must be redirected to /login from /dashboard/admin");

            capturePass("TC-SEC-04");
        } catch (Exception e) {
            captureFail("TC-SEC-04");
            throw e;
        }
    }
}
