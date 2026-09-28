package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;

public class AppointmentPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By petSelect = By.xpath("//label[contains(text(), 'Select Patient Pet')]/following-sibling::select");
    private final By vetSelect = By.xpath("//label[contains(text(), 'Select Veterinarian')]/following-sibling::select");
    private final By dateInput = By.xpath("//label[contains(text(), 'Appointment Date')]/following-sibling::input");
    private final By timeSlotButton = By.xpath("//button[contains(., '10:00 AM') or contains(., '11:00 AM') or contains(., '02:00 PM')]");
    private final By submitAppointmentBtn = By.cssSelector("form button[type='submit']");
    private final By appointmentCards = By.xpath("//*[contains(@class, 'rounded-') and (contains(., 'UPCOMING') or contains(., 'COMPLETED') or contains(., 'Dr.'))]");
    private final By validationErrors = By.xpath("//p[contains(text(), 'Select a registered pet') or contains(text(), 'Select a veterinarian') or contains(text(), 'Date is required') or contains(text(), 'cannot be in the past')]");

    public AppointmentPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(petSelect)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void submitEmptyForm() {
        WebElement submit = wait.until(ExpectedConditions.elementToBeClickable(submitAppointmentBtn));
        submit.click();
    }

    public boolean hasValidationErrors() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(validationErrors)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean bookConsultationForTomorrow() {
        try {
            Select petDropdown = new Select(wait.until(ExpectedConditions.elementToBeClickable(petSelect)));
            if (petDropdown.getOptions().size() > 1) {
                petDropdown.selectByIndex(1);
            }

            Select vetDropdown = new Select(driver.findElement(vetSelect));
            if (vetDropdown.getOptions().size() > 1) {
                vetDropdown.selectByIndex(1);
            }

            WebElement dateEl = driver.findElement(dateInput);
            String tomorrow = LocalDate.now().plusDays(2).toString();
            dateEl.clear();
            dateEl.sendKeys(tomorrow);

            // Select time slot
            List<WebElement> slots = driver.findElements(timeSlotButton);
            if (!slots.isEmpty()) {
                slots.get(0).click();
            }

            // Submit
            driver.findElement(submitAppointmentBtn).click();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public int getAppointmentsCount() {
        try {
            return driver.findElements(appointmentCards).size();
        } catch (Exception e) {
            return 0;
        }
    }
}
