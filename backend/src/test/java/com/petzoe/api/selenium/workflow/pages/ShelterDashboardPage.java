package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ShelterDashboardPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By statusBadge = By.xpath("//*[contains(text(), 'Verification Status')]/following-sibling::h3 | //*[contains(text(), 'Verification Status')]/following-sibling::span");
    private final By shelterNameHeading = By.xpath("//*[contains(text(), 'Shelter')]/following-sibling::h3");
    private final By capacityValue = By.xpath("//*[contains(text(), 'Capacity')]/following-sibling::h3");
    private final By profileForm = By.xpath("//h2[contains(text(), 'Shelter Information')]");
    private final By signOutButton = By.xpath("//aside//button[contains(., 'Sign Out') or contains(., 'Logout')] | //button[contains(., 'Sign Out')]");

    public ShelterDashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.urlContains("/dashboard/shelter"));
        } catch (Exception e) {
            return false;
        }
    }

    public void navigateToTab(String tabName) {
        By tabLocator = By.xpath(String.format(
                "//aside//button[contains(., '%s')] | //nav//button[contains(., '%s')]", tabName, tabName));
        WebElement tab = wait.until(ExpectedConditions.elementToBeClickable(tabLocator));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", tab);
        try {
            tab.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", tab);
        }
    }

    public String getVerificationStatus() {
        try {
            WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(statusBadge));
            return el.getText().trim().toUpperCase();
        } catch (Exception e) {
            return "";
        }
    }

    public String getShelterName() {
        try {
            WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(shelterNameHeading));
            return el.getText().trim();
        } catch (Exception e) {
            return "";
        }
    }

    public String getCapacity() {
        try {
            WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(capacityValue));
            return el.getText().trim();
        } catch (Exception e) {
            return "";
        }
    }

    public boolean isProfileChecklistVisible() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(text(), 'Profile Checklist') or contains(text(), 'Shelter Information')]"))).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void signOut() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(signOutButton));
        btn.click();
        wait.until(ExpectedConditions.urlContains("/login"));
    }
}
