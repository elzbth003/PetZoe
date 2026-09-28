package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.OwnerDashboardPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

public class AuthWorkflowTest extends BaseTest {

    @Test
    @DisplayName("TC-AUTH-01: Valid Login as Pet Owner")
    void testValidLogin() {
        try {
            logStep("Open PetZoe login page (/login)");
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            assertTrue(loginPage.isLoaded(), "Login page should be loaded");
            logStep("Login page loaded and verified with email and password inputs");

            logStep("Enter registered pet owner credentials (" + TestData.OWNER_EMAIL + ")");
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

            logStep("Verify authentication success and redirection to Owner Dashboard");
            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            assertTrue(dashboard.isLoaded(), "User should reach the Pet Owner dashboard");
            logStep("Pet Owner dashboard loaded successfully with active session");

            capturePass("TC-AUTH-01");
        } catch (Exception e) {
            captureFail("TC-AUTH-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-AUTH-02: Invalid Login Displays Error Toast")
    void testInvalidLogin() {
        try {
            logStep("Open PetZoe login page (/login)");
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            assertTrue(loginPage.isLoaded(), "Login page should be loaded");

            logStep("Submit invalid credentials: " + TestData.INVALID_EMAIL);
            loginPage.login(TestData.INVALID_EMAIL, TestData.INVALID_PASSWORD);

            logStep("Verify authentication rejection and error toast/banner feedback");
            assertTrue(loginPage.hasAuthErrorFeedback(), "Failed login must display error feedback and remain on /login");
            logStep("Authentication error banner displayed and user remains safely on /login");

            capturePass("TC-AUTH-02");
        } catch (Exception e) {
            captureFail("TC-AUTH-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-AUTH-03: Logout Terminates Session and Blocks Access")
    void testLogoutTerminatesSession() {
        try {
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            assertTrue(dashboard.isLoaded(), "Owner must be logged in");

            dashboard.signOut();

            // Verify redirection to /login
            wait.until(ExpectedConditions.urlContains("/login"));
            assertTrue(driver.getCurrentUrl().contains("/login"), "Must redirect to /login upon sign out");

            // Attempt direct navigation to protected dashboard
            navigateTo("/dashboard/owner");
            wait.until(ExpectedConditions.urlContains("/login"));
            assertTrue(driver.getCurrentUrl().contains("/login"), "Protected route must redirect unauthenticated user to /login");

            capturePass("TC-AUTH-03");
        } catch (Exception e) {
            captureFail("TC-AUTH-03");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-AUTH-04: Session Persists Across Page Refresh")
    void testSessionPersistenceOnRefresh() {
        try {
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            assertTrue(dashboard.isLoaded());

            // Refresh browser
            driver.navigate().refresh();

            // Verify session is retained
            assertTrue(dashboard.isLoaded(), "Session must persist and retain user on Owner Dashboard");

            capturePass("TC-AUTH-04");
        } catch (Exception e) {
            captureFail("TC-AUTH-04");
            throw e;
        }
    }
}
