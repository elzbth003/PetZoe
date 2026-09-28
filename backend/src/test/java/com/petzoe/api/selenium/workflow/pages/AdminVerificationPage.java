package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class AdminVerificationPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By shelterHeader = By.xpath("//h2[contains(text(), 'Shelter Verification')]");
    private final By vetHeader = By.xpath("//h1[contains(., 'Veterinarian Management')]");
    private final By productHeader = By.xpath("//h2[contains(., 'Product Moderation')]");

    private final By shelterCards = By.xpath("//div[contains(@class, 'cursor-pointer') and .//p[contains(@class, 'font-bold')]]");
    private final By vetTableRows = By.xpath("//table//tbody//tr");
    private final By productTableRows = By.xpath("//table//tbody//tr");

    public AdminVerificationPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isShelterVerificationLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(shelterHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isVetManagementLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(vetHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isProductModerationLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(productHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public int getShelterCardsCount() {
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(shelterCards));
            return driver.findElements(shelterCards).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public void filterSheltersBy(String status) {
        By btnXpath = By.xpath(String.format(
                "//button[text()='%s' or contains(text(), '%s')]", status, status));
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(btnXpath));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        btn.click();
    }

    public void selectShelter(String shelterName) {
        By itemXpath = By.xpath(String.format(
                "//div[contains(@class, 'cursor-pointer')][.//p[contains(., '%s')]]", shelterName));
        WebElement item = wait.until(ExpectedConditions.elementToBeClickable(itemXpath));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", item);
        item.click();
    }

    public boolean isShelterDetailOpen() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//h4[contains(., 'Supporting Documents')] | //h4[contains(., 'Decision')]"))).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public int getVetRowsCount() {
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(vetTableRows));
            return driver.findElements(vetTableRows).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean hasVetRowWithEmail(String email) {
        try {
            By itemXpath = By.xpath(String.format("//td[contains(., '%s')]", email));
            return wait.until(ExpectedConditions.visibilityOfElementLocated(itemXpath)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
