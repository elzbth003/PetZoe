package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class AdminUsersPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By heading = By.xpath("//h1[contains(text(), 'User Management')]");
    private final By searchInput = By.xpath("//input[@placeholder='Search users...']");
    private final By userRows = By.xpath("//table//tbody//tr");
    private final By roleFilterToggle = By.xpath("//div[contains(@class, 'cursor-pointer') and (.//span[contains(text(), 'Role') or contains(text(), 'All')])] ");

    public AdminUsersPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(heading)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void searchUser(String query) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(searchInput));
        input.clear();
        input.sendKeys(query);
    }

    public int getUserRowsCount() {
        try {
            List<WebElement> rows = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(userRows));
            return rows.size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean hasUserWithEmail(String email) {
        try {
            By locator = By.xpath(String.format("//table//tbody//tr[contains(., '%s')]", email));
            return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
