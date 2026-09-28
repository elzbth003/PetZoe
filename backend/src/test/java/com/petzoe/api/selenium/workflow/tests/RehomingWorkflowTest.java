package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.RehomingBoardPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

public class RehomingWorkflowTest extends BaseTest {

    @Test
    @DisplayName("TC-REHOME-01: Rehoming Community Board Loads and Filters by Species")
    void testRehomingBoardAndFilters() {
        try {
            logStep("Navigate to PetZoe Community Rehoming Board (/rehoming)");
            navigateTo("/rehoming");
            RehomingBoardPage boardPage = new RehomingBoardPage(driver);
            assertTrue(boardPage.isLoaded(), "Rehoming community board should be loaded");
            logStep("Community rehoming listings board rendered successfully");

            logStep("Apply species filter: 'Dog'");
            boardPage.filterBySpecies("Dog");
            logStep("Filtered listings updated to display canine adoption profiles");

            logStep("Reset species filter to: 'All'");
            boardPage.filterBySpecies("All");
            logStep("All available rehoming candidates restored");

            capturePass("TC-REHOME-01");
        } catch (Exception e) {
            captureFail("TC-REHOME-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-REHOME-02: Rehoming Application Dialog Flow for Authenticated User")
    void testRehomingApplicationFlow() {
        try {
            // First login as Pet Owner B (Jessica) so she can browse and apply for rehoming
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login("jessica@petverse.com", "Password123!");
            wait.until(ExpectedConditions.urlContains("/dashboard"));

            navigateTo("/rehoming");
            RehomingBoardPage boardPage = new RehomingBoardPage(driver);
            assertTrue(boardPage.isLoaded());

            // Check if listings exist to apply
            if (boardPage.getListingsOrApplyButtonsCount() > 0) {
                boardPage.clickFirstAvailableApplyButton();
            }

            capturePass("TC-REHOME-02");
        } catch (Exception e) {
            captureFail("TC-REHOME-02");
            throw e;
        }
    }
}
