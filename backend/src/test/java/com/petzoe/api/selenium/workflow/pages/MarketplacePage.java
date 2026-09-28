package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class MarketplacePage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By productCards = By.xpath("//div[contains(@class, 'group') and .//h3]");
    private final By cartLink = By.xpath("//a[contains(@href, '/marketplace/cart')]");
    private final By marketplaceHeading = By.xpath("//h1[contains(., 'Products') or contains(., 'Search Results')]");

    private final By searchInput = By.xpath("//input[@placeholder='Search products...']");

    public MarketplacePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(marketplaceHeading)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void search(String keyword) {
        try {
            WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(searchInput));
            input.clear();
            input.sendKeys(keyword);
            Thread.sleep(1000);
        } catch (Exception ignored) {
        }
    }

    public int getProductCardsCount() {
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(productCards));
            return driver.findElements(productCards).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean hasProductNamed(String name) {
        try {
            By itemXpath = By.xpath(String.format("//h3[contains(., '%s')]", name));
            return wait.until(ExpectedConditions.visibilityOfElementLocated(itemXpath)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void addFirstProductToCart() {
        wait.until(ExpectedConditions.presenceOfElementLocated(productCards));
        WebElement firstAddBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//div[contains(@class, 'group') and .//h3]//button[@aria-label='Add to cart' or @title='Add to Cart']")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", firstAddBtn);
        try {
            firstAddBtn.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", firstAddBtn);
        }
        try {
            Thread.sleep(1000);
        } catch (InterruptedException ignored) {
        }
    }

    public void addProductToCart(String productName) {
        By cardXpath = By.xpath(String.format(
                "//div[contains(@class, 'group')][.//h3[contains(., '%s')]]", productName));
        WebElement card = wait.until(ExpectedConditions.visibilityOfElementLocated(cardXpath));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", card);

        By addBtnXpath = By.xpath(String.format(
                "//div[contains(@class, 'group')][.//h3[contains(., '%s')]]//button[@aria-label='Add to cart' or @title='Add to Cart']", productName));
        WebElement addBtn = wait.until(ExpectedConditions.elementToBeClickable(addBtnXpath));
        try {
            addBtn.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", addBtn);
        }
    }

    public void openCart() {
        WebElement link = wait.until(ExpectedConditions.presenceOfElementLocated(cartLink));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", link);
        try {
            link.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", link);
        }
    }
}
