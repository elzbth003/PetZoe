package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class OwnerDashboardPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By totalPetsCard = By.xpath("//*[contains(text(), 'Total Pets Registered')]/following-sibling::h3");
    private final By signOutButton = By.xpath("//button[.//span[contains(text(), 'Sign Out')]] | //button[contains(., 'Sign Out')]");

    public OwnerDashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.urlContains("/dashboard/owner"));
        } catch (Exception e) {
            return false;
        }
    }

    public void navigateToTab(String tabName) {
        By tabLocator = By.xpath(String.format(
                "//nav//button[contains(., '%s')] | //aside//button[contains(., '%s')]", tabName, tabName));
        WebElement tab = wait.until(ExpectedConditions.elementToBeClickable(tabLocator));
        tab.click();
    }

    public String getTotalPetsRegistered() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(totalPetsCard)).getText().trim();
        } catch (Exception e) {
            return "0";
        }
    }

    public void signOut() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(signOutButton));
        btn.click();
        wait.until(ExpectedConditions.urlContains("/login"));
    }
}
