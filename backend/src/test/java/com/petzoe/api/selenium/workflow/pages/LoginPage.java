package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By emailInput = By.id("email");
    private final By passwordInput = By.id("password");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By emailError = By.xpath("//p[contains(text(), 'Email address is required') or contains(text(), 'valid email')]");
    private final By passwordError = By.xpath("//p[contains(text(), 'Password is required')]");
    private final By welcomeHeader = By.xpath("//h2[contains(text(), 'Welcome Back')]");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(welcomeHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void login(String email, String password) {
        WebElement emailEl = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", emailEl);
        emailEl.clear();
        emailEl.sendKeys(email);

        WebElement passEl = driver.findElement(passwordInput);
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", passEl);
        passEl.clear();
        passEl.sendKeys(password);

        WebElement btn = wait.until(ExpectedConditions.presenceOfElementLocated(submitButton));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        try {
            wait.until(ExpectedConditions.elementToBeClickable(btn)).click();
        } catch (Exception e) {
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        }
    }

    public boolean hasEmailError() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(emailError)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasPasswordError() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(passwordError)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasAuthErrorFeedback() {
        try {
            return wait.until(d -> {
                boolean hasToast = !d.findElements(By.xpath("//*[contains(text(), 'Invalid') or contains(text(), 'credentials') or contains(text(), 'failed')]")).isEmpty();
                boolean onLoginPage = d.getCurrentUrl().contains("/login");
                return hasToast || onLoginPage;
            });
        } catch (Exception e) {
            return false;
        }
    }
}
