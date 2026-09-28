package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class AddProductPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By wizardHeader = By.xpath("//h2[contains(text(), 'Add New Product')]");
    private final By nameInput = By.name("name");
    private final By brandInput = By.name("brand");
    private final By categorySelect = By.name("categoryId");
    private final By skuInput = By.name("sku");
    private final By petTypeSelect = By.name("petType");
    private final By shortDescInput = By.name("shortDescription");

    private final By mrpInput = By.name("mrp");
    private final By priceInput = By.name("price");
    private final By stockInput = By.name("stockQuantity");
    private final By lowStockInput = By.name("lowStockThreshold");

    private final By nextStepBtn = By.xpath("//button[contains(., 'Next Step')]");
    private final By backBtn = By.xpath("//button[contains(., 'Back')]");
    private final By saveDraftBtn = By.xpath("//button[contains(., 'Save as Draft')]");
    private final By submitForReviewBtn = By.xpath("//button[contains(., 'Submit for Review')]");
    private final By errorAlertBox = By.xpath("//div[contains(@class, 'bg-rose-50')]//span");

    public AddProductPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(wizardHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void fillStep1(String name, String brand, String categoryIdOrText, String sku, String petType, String shortDesc) {
        if (name != null) {
            WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(nameInput));
            el.clear();
            el.sendKeys(name);
        }
        if (brand != null) {
            WebElement el = driver.findElement(brandInput);
            el.clear();
            el.sendKeys(brand);
        }
        if (categoryIdOrText != null) {
            try {
                Select sel = new Select(driver.findElement(categorySelect));
                try {
                    sel.selectByVisibleText(categoryIdOrText);
                } catch (Exception e) {
                    sel.selectByIndex(1); // Fallback to first available category
                }
            } catch (Exception ignored) {}
        }
        if (sku != null) {
            WebElement el = driver.findElement(skuInput);
            el.clear();
            el.sendKeys(sku);
        }
        if (petType != null) {
            try {
                Select sel = new Select(driver.findElement(petTypeSelect));
                sel.selectByVisibleText(petType);
            } catch (Exception ignored) {}
        }
        if (shortDesc != null) {
            WebElement el = driver.findElement(shortDescInput);
            el.clear();
            el.sendKeys(shortDesc);
        }
    }

    public void clickNext() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(nextStepBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        btn.click();
    }

    public void fillStep2(String mrp, String price, String stockQuantity, String lowStock) {
        if (mrp != null) {
            WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(mrpInput));
            el.clear();
            el.sendKeys(mrp);
        }
        if (price != null) {
            WebElement el = driver.findElement(priceInput);
            el.clear();
            el.sendKeys(price);
        }
        if (stockQuantity != null) {
            WebElement el = driver.findElement(stockInput);
            el.clear();
            el.sendKeys(stockQuantity);
        }
        if (lowStock != null) {
            WebElement el = driver.findElement(lowStockInput);
            el.clear();
            el.sendKeys(lowStock);
        }
    }

    public void clickSaveDraft() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(saveDraftBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        btn.click();
    }

    public void clickSubmitForReview() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(submitForReviewBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        btn.click();
    }

    public String getErrorMessage() {
        try {
            WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(errorAlertBox));
            return el.getText().trim();
        } catch (Exception e) {
            return "";
        }
    }

    public boolean hasErrorMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(errorAlertBox)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void handleAlertIfPresent() {
        try {
            WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(3));
            Alert alert = shortWait.until(ExpectedConditions.alertIsPresent());
            alert.accept();
        } catch (Exception ignored) {}
    }
}
