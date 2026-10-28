package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class VetDashboardPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By appointmentCards = By.xpath("//div[contains(@class, 'rounded-3xl') and .//h4[contains(@class, 'font-black')]]");
    private final By signOutButton = By.xpath("//aside//button[contains(., 'Sign Out') or contains(., 'Logout')] | //button[contains(., 'Sign Out')]");

    public VetDashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public boolean isLoaded() {
        try {
            return wait.until(d -> d.getCurrentUrl().contains("/dashboard/vet"));
        } catch (Exception e) {
            return false;
        }
    }

    public void goToAppointmentsTab() {
        try {
            By apptTab = By.xpath("//aside//button[contains(., 'Appointments')] | //button[contains(., 'View Consultation Schedule')]");
            WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(apptTab));
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
            btn.click();
            wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.xpath("//div[contains(@class, 'bg-slate-200/70')] | //button[contains(., 'Confirmed')]")));
        } catch (Exception ignored) {
        }
    }

    public void filterByStatus(String statusName) {
        goToAppointmentsTab();
        By filterBtn = By.xpath(String.format(
                "//button[.//span[contains(., '%s')] or contains(., '%s')][contains(@class, 'rounded')]", statusName, statusName));
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(filterBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        btn.click();
        try {
            Thread.sleep(500);
        } catch (InterruptedException ignored) {
        }
    }

    public int getAppointmentsCount() {
        goToAppointmentsTab();
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(appointmentCards));
            return driver.findElements(appointmentCards).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean hasAppointmentForPet(String petName) {
        goToAppointmentsTab();
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(appointmentCards));
            By apptXpath = By.xpath(String.format(
                    "//div[contains(@class, 'rounded-3xl')][.//h4[contains(., '%s')]]", petName));
            return !driver.findElements(apptXpath).isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    public void acceptAppointment(String petName) {
        goToAppointmentsTab();
        By cardXpath = By.xpath(String.format(
                "//div[contains(@class, 'rounded-3xl')][.//h4[contains(., '%s')]]", petName));
        WebElement card = wait.until(ExpectedConditions.visibilityOfElementLocated(cardXpath));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", card);

        By acceptBtnXpath = By.xpath(String.format(
                "//div[contains(@class, 'rounded-3xl')][.//h4[contains(., '%s')]]//button[contains(., 'Accept Visit')]", petName));
        WebElement acceptBtn = wait.until(ExpectedConditions.elementToBeClickable(acceptBtnXpath));
        acceptBtn.click();
    }

    public void startConsultationForPet(String petName) {
        goToAppointmentsTab();
        By startBtnXpath = By.xpath(String.format(
                "//div[contains(@class, 'rounded-3xl')][.//h4[contains(., '%s')]]//button[contains(., 'Record Clinical Exam') or contains(., 'Start Consultation') or contains(., 'Resume Active Consultation') or contains(., 'Complete Clinical Record')]", petName));
        WebElement startBtn = wait.until(ExpectedConditions.elementToBeClickable(startBtnXpath));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", startBtn);
        try {
            startBtn.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", startBtn);
        }
    }

    public void signOut() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(signOutButton));
        btn.click();
        wait.until(ExpectedConditions.urlContains("/login"));
    }
}
