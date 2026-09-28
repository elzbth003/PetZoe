package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class RegisterPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By heading = By.xpath("//h2[contains(text(), 'Create Account')]");
    private final By nameInput = By.id("name");
    private final By emailInput = By.id("email");
    private final By phoneInput = By.id("phone");
    private final By passwordInput = By.id("password");
    private final By confirmPasswordInput = By.id("confirmPassword");
    private final By termsCheckbox = By.xpath("//input[@type='checkbox']");
    private final By submitButton = By.cssSelector("button[type='submit']");

    private final By nameError = By.xpath("//p[contains(text(), 'Full name is required') or contains(text(), 'Name can only contain') or contains(text(), 'characters')]");
    private final By emailError = By.xpath("//p[contains(text(), 'Email address is required') or contains(text(), 'valid email')]");
    private final By phoneError = By.xpath("//p[contains(text(), 'Phone number is required') or contains(text(), 'valid 10-digit mobile')]");
    private final By passwordError = By.xpath("//p[contains(text(), 'Password is required') or contains(text(), 'at least 8 characters') or contains(text(), 'Must contain')]");
    private final By confirmPasswordError = By.xpath("//p[contains(text(), 'Confirm password is required') or contains(text(), 'Passwords do not match')]");
    private final By termsError = By.xpath("//p[contains(text(), 'accept the terms')]");

    public RegisterPage(WebDriver driver) {
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

    public void submitForm() {
        WebElement btn = wait.until(ExpectedConditions.presenceOfElementLocated(submitButton));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", btn);
        try {
            Thread.sleep(150);
        } catch (InterruptedException ignored) {}
        try {
            wait.until(ExpectedConditions.elementToBeClickable(btn)).click();
        } catch (Exception e) {
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        }
    }

    public void fillName(String name) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(nameInput));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", el);
        el.clear();
        el.sendKeys(name);
    }

    public void fillEmail(String email) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", el);
        el.clear();
        el.sendKeys(email);
    }

    public void fillPhone(String phone) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(phoneInput));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", el);
        el.clear();
        el.sendKeys(phone);
    }

    public void fillPassword(String password) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInput));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", el);
        el.clear();
        el.sendKeys(password);
    }

    public void fillConfirmPassword(String confirmPassword) {
        WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(confirmPasswordInput));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", el);
        el.clear();
        el.sendKeys(confirmPassword);
    }

    public void toggleTermsCheckbox(boolean check) {
        WebElement chk = wait.until(ExpectedConditions.presenceOfElementLocated(termsCheckbox));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", chk);
        try {
            Thread.sleep(100);
        } catch (InterruptedException ignored) {}
        if (chk.isSelected() != check) {
            try {
                chk.click();
            } catch (Exception e) {
                ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", chk);
            }
        }
    }

    public boolean hasNameError() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(nameError)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getNameErrorMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(nameError)).getText().trim();
        } catch (Exception e) {
            return "";
        }
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

    public boolean hasPhoneError() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(phoneError)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getPhoneErrorMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(phoneError)).getText().trim();
        } catch (Exception e) {
            return "";
        }
    }

    public boolean hasPasswordError() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(passwordError)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getPasswordErrorMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(passwordError)).getText().trim();
        } catch (Exception e) {
            return "";
        }
    }

    public boolean hasConfirmPasswordError() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(confirmPasswordError)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getConfirmPasswordErrorMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(confirmPasswordError)).getText().trim();
        } catch (Exception e) {
            return "";
        }
    }

    public boolean hasTermsError() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(termsError)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
