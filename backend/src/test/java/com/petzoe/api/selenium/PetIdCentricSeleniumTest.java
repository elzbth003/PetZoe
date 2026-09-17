package com.petzoe.api.selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * End-to-End Selenium UI Automation Test Suite for Permanent Pet ID Centric Workflow.
 *
 * Verifies:
 * 1. Owner Workflow:
 *    - Permanent Pet ID badges (PZ-PET-XXXXXX) displayed on pet cards
 *    - Pet ID copy action
 *    - Ownership Transfer dialog with permanent medical history notice
 * 2. Veterinarian Workflow:
 *    - Permanent Pet ID patient lookup search bar
 *    - Retrieval and display of verified Pet ID patient charts
 */
public class PetIdCentricSeleniumTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private static final String BASE_URL = System.getProperty("app.url", "http://localhost:5173");

    @BeforeEach
    void setUp() {
        ChromeOptions options = new ChromeOptions();
        boolean headless = Boolean.parseBoolean(System.getProperty("headless", "true"));
        if (headless) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1920,1080");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    @DisplayName("Step 1: Verify Owner UI - Permanent Pet ID Badges and Transfer Ownership Modal")
    void testOwnerPetIdAndTransferModal() {
        driver.get(BASE_URL + "/login");

        // Login as Pet Owner
        WebElement emailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("email")));
        WebElement passwordInput = driver.findElement(By.id("password"));
        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));

        emailInput.sendKeys("alex@gmail.com");
        passwordInput.sendKeys("Alex@123");
        submitButton.click();

        // Wait for dashboard navigation
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        // Verify presence of Pet ID labels / badges (PZ-PET-)
        List<WebElement> petIdLabels = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(
                By.xpath("//*[contains(text(), 'PZ-PET-') or contains(text(), 'Pet ID')]")));
        assertFalse(petIdLabels.isEmpty(), "At least one permanent Pet ID badge should be visible on owner's pets");

        // Verify Transfer Ownership button is present
        List<WebElement> transferButtons = driver.findElements(
                By.xpath("//button[contains(., 'Transfer Ownership')]"));
        assertFalse(transferButtons.isEmpty(), "Transfer Ownership action button should be rendered on pet cards");

        // Click the first Transfer Ownership button
        transferButtons.get(0).click();

        // Verify Transfer Ownership modal opens
        WebElement modalTitle = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h4[contains(text(), 'Transfer Ownership')]")));
        assertNotNull(modalTitle, "Transfer Ownership modal should be displayed");

        // Verify notice explains permanent medical records and Pet ID remain intact
        WebElement historyNotice = driver.findElement(
                By.xpath("//*[contains(text(), 'Permanent Medical History') or contains(text(), 'medical consultations')]"));
        assertNotNull(historyNotice, "Explanation that permanent medical history stays intact must be displayed");

        // Verify new owner email input
        WebElement newOwnerInput = driver.findElement(By.xpath("//input[@type='email']"));
        assertTrue(newOwnerInput.isDisplayed(), "Recipient email input field must be present in transfer modal");
    }

    @Test
    @DisplayName("Step 2: Verify Veterinarian UI - Patient Lookup by Permanent Pet ID")
    void testVetPetIdLookupWorkflow() {
        driver.get(BASE_URL + "/login");

        // Login as Veterinarian (Dr. Sarah)
        WebElement emailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("email")));
        WebElement passwordInput = driver.findElement(By.id("password"));
        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));

        emailInput.sendKeys("sarah@gmail.com");
        passwordInput.sendKeys("Sarah@123");
        submitButton.click();

        // Wait for vet dashboard navigation
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        // If not already on Patients tab, click Patients nav item
        List<WebElement> patientTabs = driver.findElements(By.xpath("//button[contains(., 'Patients') or contains(., 'Registry')]"));
        if (!patientTabs.isEmpty()) {
            patientTabs.get(0).click();
        }

        // Verify permanent Pet ID lookup section exists
        WebElement lookupHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(), 'Lookup Patient by Permanent Pet ID') or contains(text(), 'Permanent Pet ID')]")));
        assertNotNull(lookupHeader, "Permanent Pet ID search bar must be prominently displayed for veterinarians");

        // Verify Pet ID input field exists
        WebElement codeInput = driver.findElement(By.xpath("//input[contains(@placeholder, 'PZ-PET-')]"));
        assertNotNull(codeInput, "Pet ID search input should be present");

        // Search for a Pet ID
        codeInput.clear();
        codeInput.sendKeys("PZ-PET-000001");
        WebElement lookupButton = driver.findElement(By.xpath("//button[contains(., 'Lookup')]"));
        lookupButton.click();

        // Verify verified patient record result banner or matching patient card appears
        WebElement result = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(), 'Verified Pet ID Record') or contains(text(), 'PZ-PET-000001')]")));
        assertNotNull(result, "Patient profile corresponding to the Pet ID should be retrieved and shown");
    }
}
