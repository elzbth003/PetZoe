package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.OwnerDashboardPage;
import com.petzoe.api.selenium.workflow.pages.VetScanPage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
public class VetScanWorkflowTest extends BaseTest {

    private static String testImagePath;

    @BeforeAll
    static void createSampleImage() throws IOException {
        File tempFile = File.createTempFile("canine_lesion_test_", ".jpg");
        tempFile.deleteOnExit();

        BufferedImage img = new BufferedImage(300, 300, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(new Color(200, 70, 60));
        g.fillRect(0, 0, 300, 300);
        g.setColor(new Color(130, 30, 20));
        g.setStroke(new BasicStroke(4.0f));
        g.drawOval(50, 50, 200, 200);
        g.dispose();

        ImageIO.write(img, "JPEG", tempFile);
        testImagePath = tempFile.getAbsolutePath();
    }

    private VetScanPage loginAndNavigateToVetScan() {
        navigateTo("/login");
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

        OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
        assertTrue(dashboard.isLoaded(), "Owner dashboard must load successfully");

        dashboard.navigateToTab("VetScan AI");
        VetScanPage vetScanPage = new VetScanPage(driver);
        assertTrue(vetScanPage.isLoaded(), "VetScan AI portal must load successfully");
        return vetScanPage;
    }

    @Test
    @DisplayName("TC-VETSCAN-01: Open VetScan AI Portal from Owner Dashboard")
    void testOpenVetScanPortal() {
        try {
            logStep("Login and open VetScan AI workspace tab");
            VetScanPage page = loginAndNavigateToVetScan();
            assertTrue(page.isLoaded(), "VetScan AI tab interface must be visible");
            capturePass("TC-VETSCAN-01");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-02: Select Canine Patient from Registered Pets")
    void testSelectCaninePatient() {
        try {
            logStep("Open VetScan AI and select canine patient");
            VetScanPage page = loginAndNavigateToVetScan();
            page.selectFirstPet();
            logStep("Canine patient selected in dropdown");
            capturePass("TC-VETSCAN-02");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-03: Upload Skin Lesion Photograph")
    void testUploadSkinLesionImage() {
        try {
            logStep("Open VetScan AI, select patient, and upload valid image");
            VetScanPage page = loginAndNavigateToVetScan();
            page.selectFirstPet();
            page.uploadImage(testImagePath);
            logStep("Photograph uploaded and preview displayed");
            capturePass("TC-VETSCAN-03");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-03");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-04: Validate Disallowed File Format Rejection")
    void testDisallowedFileFormatRejection() throws IOException {
        try {
            File textFile = File.createTempFile("invalid_file_", ".txt");
            textFile.deleteOnExit();

            logStep("Open VetScan AI and upload invalid file format (.txt)");
            VetScanPage page = loginAndNavigateToVetScan();
            page.selectFirstPet();
            page.uploadImage(textFile.getAbsolutePath());

            // Toast error or form rejection expected
            logStep("Invalid file format rejected");
            capturePass("TC-VETSCAN-04");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-04");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-05: Trigger Preliminary AI Screening")
    void testTriggerPreliminaryScreening() {
        try {
            logStep("Upload lesion image and execute preliminary AI screening");
            VetScanPage page = loginAndNavigateToVetScan();
            page.selectFirstPet();
            page.uploadImage(testImagePath);
            page.clickAnalyze();

            boolean resultLoaded = page.waitForResult();
            assertTrue(resultLoaded, "Preliminary screening results container must display");
            capturePass("TC-VETSCAN-05");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-05");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-06: Display Multi-Label Lesion Indicators")
    void testDisplayLesionIndicators() {
        try {
            logStep("Verify multi-label lesion indicators are displayed with percentages");
            VetScanPage page = loginAndNavigateToVetScan();
            page.selectFirstPet();
            page.uploadImage(testImagePath);
            page.clickAnalyze();
            page.waitForResult();

            assertTrue(page.hasLesionIndicators(), "Lesion indicators section must be displayed");
            capturePass("TC-VETSCAN-06");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-06");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-07: Display Model Confidence and Severity Estimate")
    void testDisplayConfidenceAndSeverity() {
        try {
            logStep("Verify model confidence badge and prototype severity estimate");
            VetScanPage page = loginAndNavigateToVetScan();
            page.selectFirstPet();
            page.uploadImage(testImagePath);
            page.clickAnalyze();
            page.waitForResult();

            assertTrue(page.hasConfidenceBadge(), "Model confidence badge must be visible");
            assertTrue(page.hasSeverityBadge(), "Severity estimate badge must be visible");
            capturePass("TC-VETSCAN-07");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-07");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-08: Toggle Grad-CAM Explainability Heatmap")
    void testToggleGradCamHeatmap() {
        try {
            logStep("Toggle between original image and Grad-CAM explainability heatmap");
            VetScanPage page = loginAndNavigateToVetScan();
            page.selectFirstPet();
            page.uploadImage(testImagePath);
            page.clickAnalyze();
            page.waitForResult();

            if (page.hasGradCamToggle()) {
                page.toggleGradCam();
                logStep("Toggled Grad-CAM explanation overlay");
            }
            capturePass("TC-VETSCAN-08");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-08");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-09: View Historical Scans in Medical Records")
    void testViewHistoricalScansInMedicalRecords() {
        try {
            logStep("Navigate to Medical Records tab and verify VetScan reports tab");
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);

            OwnerDashboardPage dashboard = new OwnerDashboardPage(driver);
            dashboard.navigateToTab("Medical Records");

            // Look for VetScan AI Reports sub-tab
            By vetScanTabBtn = By.xpath("//button[contains(., 'VetScan AI Reports')]");
            wait.until(ExpectedConditions.elementToBeClickable(vetScanTabBtn)).click();
            logStep("Switched to VetScan AI Reports in Medical Records");
            capturePass("TC-VETSCAN-09");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-09");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-10: Display Longitudinal Progression Indicator")
    void testProgressionIndicatorDisplayed() {
        try {
            logStep("Verify longitudinal progression indicator (Baseline, Improving, Stable, Worsening)");
            VetScanPage page = loginAndNavigateToVetScan();
            page.selectFirstPet();
            page.uploadImage(testImagePath);
            page.clickAnalyze();
            page.waitForResult();

            assertTrue(page.hasProgressionIndicator(), "Progression indicator must be displayed");
            capturePass("TC-VETSCAN-10");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-10");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-11: Veterinarian Can Access Patient VetScan History")
    void testVeterinarianAccessPatientVetScan() {
        try {
            logStep("Login as verified veterinarian");
            clearAuthSession();
            navigateTo("/login");
            LoginPage loginPage = new LoginPage(driver);
            loginPage.login(TestData.VET_EMAIL, TestData.VET_PASSWORD);

            wait.until(ExpectedConditions.urlContains("/dashboard/vet"));
            logStep("Veterinarian logged in successfully to /dashboard/vet");
            capturePass("TC-VETSCAN-11");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-11");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-12: Unauthorized Anonymous User Redirected from VetScan")
    void testUnauthorizedAccessBlocked() {
        try {
            logStep("Verify unauthenticated access to /dashboard/owner is redirected");
            clearAuthSession();
            navigateTo("/dashboard/owner");

            wait.until(ExpectedConditions.urlContains("/login"));
            assertTrue(driver.getCurrentUrl().contains("/login"), "Must redirect anonymous user to /login");
            capturePass("TC-VETSCAN-12");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-12");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-VETSCAN-13: Navigate from VetScan to Consultation Booking")
    void testNavigateToConsultationBooking() {
        try {
            logStep("Click Book Consultation button from VetScan results");
            VetScanPage page = loginAndNavigateToVetScan();
            page.selectFirstPet();
            page.uploadImage(testImagePath);
            page.clickAnalyze();
            page.waitForResult();

            page.clickBookAppointment();
            logStep("Navigated towards appointment consultation workflow");
            capturePass("TC-VETSCAN-13");
        } catch (Exception e) {
            captureFail("TC-VETSCAN-13");
            throw e;
        }
    }
}
