package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ForgotPasswordPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By heading = By.xpath("//h2[contains(text(), 'Reset Password') or contains(text(), 'Forgot Password')]");
    private final By emailInput = By.id("email");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By emailError = By.xpath("//p[contains(text(), 'Email address is required') or contains(text(), 'valid email')]");

    public ForgotPasswordPage(WebDriver driver) {
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

    public void submitEmail(String email) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        input.clear();
        input.sendKeys(email);
        driver.findElement(submitButton).click();
    }

    public void submitEmpty() {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        input.clear();
        driver.findElement(submitButton).click();
    }

    public boolean hasEmailError() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(emailError)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailErrorMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(emailError)).getText().trim();
        } catch (Exception e) {
            return "";
        }
    }
}
