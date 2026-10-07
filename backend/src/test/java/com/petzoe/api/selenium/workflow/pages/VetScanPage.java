package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class VetScanPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By vetScanView = By.cssSelector("[data-testid='vetscan-view']");
    private final By petSelector = By.cssSelector("[data-testid='pet-selector']");
    private final By fileInput = By.cssSelector("[data-testid='file-input']");
    private final By analyzeButton = By.cssSelector("[data-testid='analyze-button']");
    private final By resultContainer = By.cssSelector("[data-testid='result-container']");
    private final By lesionIndicators = By.cssSelector("[data-testid='lesion-indicators']");
    private final By confidenceBadge = By.cssSelector("[data-testid='confidence-badge']");
    private final By severityBadge = By.cssSelector("[data-testid='severity-badge']");
    private final By gradCamToggle = By.cssSelector("[data-testid='gradcam-toggle']");
    private final By gradCamImage = By.cssSelector("[data-testid='gradcam-image']");
    private final By originalImage = By.cssSelector("[data-testid='original-image']");
    private final By progressionIndicator = By.cssSelector("[data-testid='progression-indicator']");
    private final By disclaimerBanner = By.cssSelector("[data-testid='disclaimer-banner']");
    private final By bookAppointmentBtn = By.cssSelector("[data-testid='book-appointment-btn']");
    private final By viewRecordsBtn = By.cssSelector("[data-testid='view-records-btn']");
    private final By scanHistoryList = By.cssSelector("[data-testid='scan-history-list']");

    public VetScanPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(vetScanView)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void selectFirstPet() {
        try {
            WebElement selectEl = wait.until(ExpectedConditions.visibilityOfElementLocated(petSelector));
            Select select = new Select(selectEl);
            if (!select.getOptions().isEmpty()) {
                select.selectByIndex(0);
            }
        } catch (Exception ignored) {}
    }

    public void uploadImage(String absoluteFilePath) {
        WebElement input = driver.findElement(fileInput);
        input.sendKeys(absoluteFilePath);
    }

    public void clickAnalyze() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(analyzeButton));
        btn.click();
    }

    public boolean waitForResult() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(resultContainer)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasLesionIndicators() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(lesionIndicators)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasConfidenceBadge() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(confidenceBadge)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasSeverityBadge() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(severityBadge)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasGradCamToggle() {
        try {
            return driver.findElements(gradCamToggle).size() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    public void toggleGradCam() {
        try {
            WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(gradCamToggle));
            btn.click();
        } catch (Exception ignored) {}
    }

    public boolean isGradCamImageDisplayed() {
        try {
            return driver.findElements(gradCamImage).size() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isOriginalImageDisplayed() {
        try {
            return driver.findElements(originalImage).size() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasProgressionIndicator() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(progressionIndicator)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasDisclaimerBanner() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(disclaimerBanner)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasScanHistory() {
        try {
            return driver.findElements(scanHistoryList).size() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    public void clickBookAppointment() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(bookAppointmentBtn));
        btn.click();
    }

    public void clickViewRecords() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(viewRecordsBtn));
        btn.click();
    }
}
