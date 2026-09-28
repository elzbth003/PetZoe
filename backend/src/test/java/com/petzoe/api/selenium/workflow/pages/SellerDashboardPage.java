package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class SellerDashboardPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By totalProductsCard = By.xpath("//*[contains(text(), 'Total Products')]/following-sibling::h3");
    private final By revenueCard = By.xpath("//*[contains(text(), 'Revenue')]/following-sibling::h3");
    private final By addProductBtn = By.xpath("//button[contains(., 'Add Product')]");
    private final By productTableRows = By.xpath("//table//tbody//tr");
    private final By signOutButton = By.xpath("//aside//button[contains(., 'Logout') or contains(., 'Sign Out')] | //button[contains(., 'Logout')]");

    public SellerDashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.urlContains("/dashboard/seller"));
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

    public String getTotalProductsCount() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(totalProductsCard)).getText().trim();
        } catch (Exception e) {
            return "0";
        }
    }

    public String getRevenue() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(revenueCard)).getText().trim();
        } catch (Exception e) {
            return "₹0";
        }
    }

    public void openAddProductWizard() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(addProductBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        try {
            btn.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        }
    }

    public int getInventoryProductsCount() {
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(productTableRows));
            return driver.findElements(productTableRows).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean hasProductWithName(String productName) {
        try {
            By itemXpath = By.xpath(String.format(
                    "//table//tbody//tr[contains(., '%s')]", productName));
            return wait.until(ExpectedConditions.visibilityOfElementLocated(itemXpath)).isDisplayed();
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
