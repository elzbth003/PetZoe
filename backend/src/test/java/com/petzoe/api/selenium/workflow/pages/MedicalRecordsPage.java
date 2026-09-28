package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class MedicalRecordsPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By petSelectorButtons = By.xpath("//div[contains(@class, 'overflow-x-auto')]//button");
    private final By clinicalTab = By.xpath("//button[contains(., 'Consultations')]");
    private final By rxTab = By.xpath("//button[contains(., 'Prescriptions')]");
    private final By vaccinesTab = By.xpath("//button[contains(., 'Vaccinations')]");

    public MedicalRecordsPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(clinicalTab)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public int getAvailablePetSelectorsCount() {
        try {
            List<WebElement> buttons = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(petSelectorButtons));
            return buttons.size();
        } catch (Exception e) {
            return 0;
        }
    }

    public void selectPet(String petName) {
        By locator = By.xpath(String.format("//div[contains(@class, 'overflow-x-auto')]//button[contains(., '%s')]", petName));
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(locator));
        btn.click();
    }

    public boolean canAccessVaccinationRecords() {
        try {
            WebElement tab = wait.until(ExpectedConditions.elementToBeClickable(vaccinesTab));
            tab.click();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
