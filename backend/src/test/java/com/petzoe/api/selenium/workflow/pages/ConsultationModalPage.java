package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ConsultationModalPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By modalHeader = By.xpath("//h2[contains(., 'Clinical Examination') or contains(., 'Active Consultation Room')]");
    private final By weightInput = By.xpath("//input[contains(@placeholder, '24.5')] | //label[contains(., 'Pet Weight')]/following-sibling::input");
    private final By healthStatusSelect = By.xpath("//label[contains(., 'Health Status')]/following-sibling::select");
    private final By symptomsInput = By.xpath("//input[contains(@placeholder, 'Coughing')] | //label[contains(., 'Observed Symptoms')]/following-sibling::input");
    private final By diagnosisInput = By.xpath("//input[contains(@placeholder, 'Kennel Cough')] | //label[contains(., 'Clinical Diagnosis')]/following-sibling::input");
    private final By treatmentInput = By.xpath("//label[contains(., 'Treatment Plan')]/following-sibling::textarea");

    private final By medNameInput = By.xpath("//input[contains(@placeholder, 'Amoxicillin')] | //label[contains(., 'Medication Name')]/following-sibling::input");
    private final By dosageInput = By.xpath("//input[contains(@placeholder, '1 Tablet')] | //label[contains(., 'Dosage')]/following-sibling::input");
    private final By freqInput = By.xpath("//input[contains(@placeholder, 'Twice daily')] | //label[contains(., 'Frequency')]/following-sibling::input");
    private final By durationInput = By.xpath("//input[contains(@placeholder, '7 Days')] | //label[contains(., 'Duration')]/following-sibling::input");

    private final By completeConsultationBtn = By.xpath("//button[@type='submit'][contains(., 'Save & Complete Consultation')]");

    public ConsultationModalPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(modalHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void fillVitals(String weightKg, String healthStatus, String symptoms) {
        if (weightKg != null) {
            WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(weightInput));
            el.clear();
            el.sendKeys(weightKg);
        }
        if (healthStatus != null) {
            try {
                Select sel = new Select(driver.findElement(healthStatusSelect));
                sel.selectByVisibleText(healthStatus);
            } catch (Exception ignored) {}
        }
        if (symptoms != null) {
            WebElement el = driver.findElement(symptomsInput);
            el.clear();
            el.sendKeys(symptoms);
        }
    }

    public void fillClinicalAssessment(String diagnosis, String treatmentPlan) {
        if (diagnosis != null) {
            WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(diagnosisInput));
            el.clear();
            el.sendKeys(diagnosis);
        }
        if (treatmentPlan != null) {
            WebElement el = driver.findElement(treatmentInput);
            el.clear();
            el.sendKeys(treatmentPlan);
        }
    }

    public void addPrescription(String medName, String dosage, String freq, String duration) {
        if (medName != null) {
            WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(medNameInput));
            el.clear();
            el.sendKeys(medName);
        }
        if (dosage != null) {
            WebElement el = driver.findElement(dosageInput);
            el.clear();
            el.sendKeys(dosage);
        }
        if (freq != null) {
            WebElement el = driver.findElement(freqInput);
            el.clear();
            el.sendKeys(freq);
        }
        if (duration != null) {
            WebElement el = driver.findElement(durationInput);
            el.clear();
            el.sendKeys(duration);
        }
    }

    public void submitConsultation() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(completeConsultationBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        try {
            btn.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        }
    }

    public boolean isClosed() {
        try {
            return wait.until(ExpectedConditions.invisibilityOfElementLocated(modalHeader));
        } catch (Exception e) {
            return false;
        }
    }
}
