package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class CartPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By cartHeader = By.xpath("//h1[contains(text(), 'Shopping Cart')]");
    private final By cartItems = By.xpath("//div[contains(@class, 'space-y-4')]//div[contains(@class, 'rounded-3xl')]");
    private final By checkoutButton = By.xpath("//button[contains(., 'Proceed to Checkout')]");
    private final By orderSummary = By.xpath("//h2[contains(text(), 'Order Summary')]");
    private final By emptyCartHeader = By.xpath("//h2[contains(text(), 'Your Cart is Empty')]");

    public CartPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(d -> d.getCurrentUrl().contains("/marketplace/cart"));
        } catch (Exception e) {
            return false;
        }
    }

    public int getCartItemsCount() {
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(cartItems));
            return driver.findElements(cartItems).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean hasProductNamed(String productName) {
        try {
            By itemXpath = By.xpath(String.format("//h3[contains(text(), '%s')]", productName));
            return wait.until(ExpectedConditions.visibilityOfElementLocated(itemXpath)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void incrementItemQuantity(int index) {
        List<WebElement> plusButtons = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(
                By.xpath("//button[text()='+']")));
        if (index < plusButtons.size()) {
            WebElement btn = plusButtons.get(index);
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
            btn.click();
        }
    }

    public String getItemQuantity(int index) {
        List<WebElement> qtySpans = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(
                By.xpath("//span[contains(@class, 'text-center font-bold') and contains(@class, 'bg-white')]")));
        if (index < qtySpans.size()) {
            return qtySpans.get(index).getText().trim();
        }
        return "1";
    }

    public void proceedToCheckout() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(checkoutButton));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        try {
            btn.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        }
    }

    public boolean isOrderPlacedOrRedirected() {
        try {
            return wait.until(d -> d.getCurrentUrl().contains("/marketplace/orders") || 
                    !d.findElements(By.xpath("//*[contains(text(), 'Order placed') or contains(text(), 'Order History')]")).isEmpty());
        } catch (Exception e) {
            return false;
        }
    }
}
