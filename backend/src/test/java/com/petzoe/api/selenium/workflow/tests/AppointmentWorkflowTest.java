package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.AppointmentPage;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.OwnerDashboardPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AppointmentWorkflowTest extends BaseTest {

    private void loginAndGoToAppointments() {
        navigateTo("/login");
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

        OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
        assertTrue(dashboard.isLoaded());
        dashboard.navigateToTab("Appointments");
    }

    @Test
    @DisplayName("TC-VET-01: Appointments Form Renders Certified Doctors and Registered Pets")
    void testAppointmentFormRendering() {
        try {
            loginAndGoToAppointments();
            AppointmentPage apptPage = new AppointmentPage(driver);
            assertTrue(apptPage.isLoaded(), "Appointments booking form should be rendered");

            capturePass("TC-VET-01");
        } catch (Exception e) {
            captureFail("TC-VET-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VET-02: Negative Validation on Blank Appointment Submission")
    void testAppointmentNegativeValidation() {
        try {
            loginAndGoToAppointments();
            AppointmentPage apptPage = new AppointmentPage(driver);
            apptPage.submitEmptyForm();

            assertTrue(apptPage.hasValidationErrors(), "Blank appointment submission must trigger validation errors");

            capturePass("TC-VET-02");
        } catch (Exception e) {
            captureFail("TC-VET-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VET-03: Book Future Consultation With Time Slot Selection")
    void testBookConsultationFlow() {
        try {
            logStep("Login to PetZoe as Pet Owner and navigate to Appointments booking");
            loginAndGoToAppointments();

            AppointmentPage apptPage = new AppointmentPage(driver);
            assertTrue(apptPage.isLoaded(), "Appointment booking page must load");
            logStep("Appointment booking console loaded");

            logStep("Select certified veterinarian, registered patient pet, future date, and available time slot");
            boolean booked = apptPage.bookConsultationForTomorrow();
            assertTrue(booked, "Consultation booking interaction should succeed");
            logStep("Consultation request submitted with slot reservation");

            capturePass("TC-VET-03");
        } catch (Exception e) {
            captureFail("TC-VET-03");
            throw e;
        }
    }
}
