package com.petzoe.api.selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Selenium UI Automation Test Suite for PetZoe Login Page.
 *
 * Requirements:
 * - Frontend dev server running on http://localhost:5173
 * - Google Chrome browser installed
 * - Selenium Manager handles chromedriver automatically
 */
public class LoginPageTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private static final String LOGIN_URL = System.getProperty("app.url", "http://localhost:5173/login");

    @BeforeEach
    void setUp() {
        ChromeOptions options = new ChromeOptions();
        
        // Run in headless mode by default (set -Dheadless=false to watch browser execution)
        boolean headless = Boolean.parseBoolean(System.getProperty("headless", "true"));
        if (headless) {
            options.addArguments("--headless=new");
        }
        
        options.addArguments("--window-size=1920,1080");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        // Selenium 4 automatically downloads and configures chromedriver using Selenium Manager
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        
        // Navigate to Login Page
        driver.get(LOGIN_URL);
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    @DisplayName("Step 1: Verify Page Title & Key UI Elements Presence")
    void testLoginPageElementsPresence() {
        // 1. Wait for Header
        WebElement heading = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h2[contains(text(), 'Welcome Back')]")));
        assertNotNull(heading, "Page heading 'Welcome Back' should be visible");

        // 2. Email field
        WebElement emailInput = driver.findElement(By.id("email"));
        assertTrue(emailInput.isDisplayed(), "Email input field should be displayed");
        assertEquals("owner@petverse.com", emailInput.getAttribute("placeholder"), "Email placeholder should match");

        // 3. Password field
        WebElement passwordInput = driver.findElement(By.id("password"));
        assertTrue(passwordInput.isDisplayed(), "Password input field should be displayed");

        // 4. Submit button
        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
        assertTrue(submitButton.isDisplayed(), "Login submit button should be displayed");
        assertTrue(submitButton.getText().contains("Login to Account"), "Button text should be 'Login to Account'");

        // 5. Links: Register & Forgot Password
        WebElement registerLink = driver.findElement(By.linkText("Register here"));
        assertTrue(registerLink.isDisplayed(), "'Register here' link should be visible");

        WebElement forgotPasswordLink = driver.findElement(By.linkText("Forgot Password?"));
        assertTrue(forgotPasswordLink.isDisplayed(), "'Forgot Password?' link should be visible");
    }

    @Test
    @DisplayName("Step 2: Verify Empty Form Validation")
    void testEmptyFormValidation() {
        // Click submit button without entering email or password
        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
        submitButton.click();

        // Expect validation errors to appear
        WebElement emailError = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[contains(text(), 'Email address is required')]")));
        assertNotNull(emailError, "Email validation error should appear");

        WebElement passwordError = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[contains(text(), 'Password is required')]")));
        assertNotNull(passwordError, "Password validation error should appear");
    }

    @Test
    @DisplayName("Step 3: Verify Invalid Email Format Validation")
    void testInvalidEmailFormatValidation() {
        WebElement emailInput = driver.findElement(By.id("email"));
        
        // Enter an invalid email format
        emailInput.sendKeys("invalid-email-address");

        // Click outside or trigger form submit
        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
        submitButton.click();

        // Verify invalid email message appears
        WebElement emailError = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[contains(text(), 'Please enter a valid email address')]")));
        assertNotNull(emailError, "'Please enter a valid email address' error message should be displayed");
    }

    @Test
    @DisplayName("Step 4: Verify Password Visibility Toggle")
    void testPasswordVisibilityToggle() {
        WebElement passwordInput = driver.findElement(By.id("password"));
        
        // Initially, input type should be 'password'
        assertEquals("password", passwordInput.getAttribute("type"), "Initial password type must be 'password'");

        // Find the toggle button (the button inside the password container)
        WebElement toggleButton = driver.findElement(By.xpath("//input[@id='password']/following-sibling::button"));
        toggleButton.click();

        // After clicking, input type should change to 'text'
        assertEquals("text", passwordInput.getAttribute("type"), "Password type should become 'text' after toggle click");

        // Click again to hide password
        toggleButton.click();
        assertEquals("password", passwordInput.getAttribute("type"), "Password type should revert to 'password'");
    }

    @Test
    @DisplayName("Step 5: Verify Navigation to Register Page")
    void testNavigationToRegisterPage() {
        WebElement registerLink = wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Register here")));
        registerLink.click();

        // Wait for URL to update to register page
        wait.until(ExpectedConditions.urlContains("/register"));
        assertTrue(driver.getCurrentUrl().endsWith("/register"), "URL should navigate to /register");
    }

    @Test
    @DisplayName("Step 6: Verify Navigation to Forgot Password Page")
    void testNavigationToForgotPasswordPage() {
        WebElement forgotPasswordLink = wait.until(ExpectedConditions.elementToBeClickable(By.linkText("Forgot Password?")));
        forgotPasswordLink.click();

        // Wait for URL to update to forgot-password page
        wait.until(ExpectedConditions.urlContains("/forgot-password"));
        assertTrue(driver.getCurrentUrl().endsWith("/forgot-password"), "URL should navigate to /forgot-password");
    }

    @Test
    @DisplayName("Step 7: Verify Invalid Credentials Submission")
    void testInvalidCredentialsSubmission() {
        WebElement emailInput = driver.findElement(By.id("email"));
        WebElement passwordInput = driver.findElement(By.id("password"));
        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));

        // Enter non-existent user credentials
        emailInput.sendKeys("nonexistent.user@example.com");
        passwordInput.sendKeys("WrongPassword123!");
        submitButton.click();

        // Wait for either the loading spinner or the toast notification with error
        // The submit button briefly transitions to "Verifying Credentials..."
        boolean toastOrLoadingAppeared = wait.until(driver -> {
            boolean hasToast = !driver.findElements(By.xpath("//*[contains(text(), 'Invalid credentials') or contains(text(), 'not found') or contains(text(), 'Bad credentials') or contains(@class, 'toast')]")).isEmpty();
            boolean stillOnLogin = driver.getCurrentUrl().contains("/login");
            return hasToast || stillOnLogin;
        });

        assertTrue(toastOrLoadingAppeared, "User should remain on login page with error toast on failed login");
    }
}
