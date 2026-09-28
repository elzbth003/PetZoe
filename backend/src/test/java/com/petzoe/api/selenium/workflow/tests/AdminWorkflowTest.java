package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.AdminUsersPage;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

public class AdminWorkflowTest extends BaseTest {

    @Test
    @DisplayName("TC-ADMIN-01: Admin Logs In and Navigates to User Management")
    void testAdminUserManagementAccess() {
        try {
            logStep("Open PetZoe login page (/login)");
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);

            logStep("Enter System Administrator credentials (" + TestData.ADMIN_EMAIL + ")");
            loginPage.login(TestData.ADMIN_EMAIL, TestData.ADMIN_PASSWORD);

            logStep("Verify successful login and redirection to Admin Dashboard");
            wait.until(ExpectedConditions.urlContains("/dashboard/admin"));

            logStep("Navigate to User Management directory (/dashboard/admin/users)");
            navigateTo("/dashboard/admin/users");

            AdminUsersPage adminUsers = new AdminUsersPage(driver);
            assertTrue(adminUsers.isLoaded(), "Admin user management screen must be accessible to Admin");
            logStep("User management administrative console loaded");

            logStep("Verify registered users table is populated with user records");
            assertTrue(adminUsers.getUserRowsCount() > 0, "Users table must display registered accounts");
            logStep("Admin directory displays registered accounts across Pet Owners, Vets, and Shelters");

            capturePass("TC-ADMIN-01");
        } catch (Exception e) {
            captureFail("TC-ADMIN-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-ADMIN-02: Admin Searches Users by Email")
    void testAdminSearchUser() {
        try {
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.ADMIN_EMAIL, TestData.ADMIN_PASSWORD);
            wait.until(ExpectedConditions.urlContains("/dashboard/admin"));

            navigateTo("/dashboard/admin/users");
            AdminUsersPage adminUsers = new AdminUsersPage(driver);
            assertTrue(adminUsers.isLoaded());

            adminUsers.searchUser("owner@petverse.com");
            assertTrue(adminUsers.hasUserWithEmail("owner@petverse.com"), "Target user row must match search term");

            capturePass("TC-ADMIN-02");
        } catch (Exception e) {
            captureFail("TC-ADMIN-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-ADMIN-03: Non-Admin (Pet Owner) Forbidden from Admin Panel")
    void testNonAdminForbiddenFromAdminRoute() {
        try {
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

            // Pet owner attempts direct navigation to Admin user management
            navigateTo("/dashboard/admin/users");

            // Verify system redirects away or blocks unauthorized role access
            boolean redirectedAway = wait.until(d -> !d.getCurrentUrl().contains("/dashboard/admin/users"));
            assertTrue(redirectedAway, "Non-admin role must be prohibited from accessing admin user management");

            capturePass("TC-ADMIN-03");
        } catch (Exception e) {
            captureFail("TC-ADMIN-03");
            throw e;
        }
    }
}
