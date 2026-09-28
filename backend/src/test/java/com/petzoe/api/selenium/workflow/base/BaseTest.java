package com.petzoe.api.selenium.workflow.base;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import com.petzoe.api.selenium.workflow.reporting.ExtentManager;
import com.petzoe.api.selenium.workflow.reporting.ExtentTestListener;
import com.petzoe.api.selenium.workflow.utils.ScreenshotUtil;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

@ExtendWith(ExtentTestListener.class)
public abstract class BaseTest {

    protected WebDriver driver;
    protected WebDriverWait wait;

    public WebDriver getDriver() {
        return driver;
    }

    @BeforeEach
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        boolean headless = Boolean.parseBoolean(System.getProperty("headless", "true"));
        if (headless) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1920,1080");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--remote-allow-origins=*");

        driver = new ChromeDriver(options);
        if (!headless) {
            driver.manage().window().maximize();
        }
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));

        // Dynamically update ExtentReports test with browser details
        ExtentTest currentTest = ExtentTestListener.getTest();
        if (currentTest != null && driver instanceof HasCapabilities) {
            try {
                Capabilities caps = ((HasCapabilities) driver).getCapabilities();
                String browserName = caps.getBrowserName();
                String browserVersion = caps.getBrowserVersion();
                if (browserName != null) {
                    currentTest.assignDevice(browserName + (browserVersion != null ? " " + browserVersion : ""));
                    ExtentManager.updateBrowserInfo(browserName, browserVersion);
                }
            } catch (Exception ignored) {}
        }
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            try {
                driver.quit();
            } catch (Exception ignored) {
            }
        }
    }

    protected void navigateTo(String path) {
        logStep("Navigate to: " + TestData.BASE_URL + path);
        driver.get(TestData.BASE_URL + path);
    }

    public static void logStep(String stepDescription) {
        ExtentTest test = ExtentTestListener.getTest();
        if (test != null) {
            test.log(Status.PASS, stepDescription);
        }
        System.out.println("[SELENIUM STEP - PASS] " + stepDescription);
    }

    public static void logInfo(String infoDescription) {
        ExtentTest test = ExtentTestListener.getTest();
        if (test != null) {
            test.log(Status.INFO, infoDescription);
        }
        System.out.println("[SELENIUM STEP - INFO] " + infoDescription);
    }

    public static void logFail(String failDescription) {
        ExtentTest test = ExtentTestListener.getTest();
        if (test != null) {
            test.log(Status.FAIL, failDescription);
        }
        System.err.println("[SELENIUM STEP - FAIL] " + failDescription);
    }

    protected void capturePass(String testId) {
        ScreenshotUtil.captureScreenshot(driver, testId, "PASS");
        try {
            String base64 = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BASE64);
            ExtentTest test = ExtentTestListener.getTest();
            if (test != null) {
                test.pass("Verified checkpoint for " + testId,
                        MediaEntityBuilder.createScreenCaptureFromBase64String(base64, testId + " - PASS").build());
            }
        } catch (Exception ignored) {}
    }

    protected void captureCheckpoint(String testId, String checkpointDescription) {
        ScreenshotUtil.captureScreenshot(driver, testId, "CHECKPOINT");
        try {
            String base64 = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BASE64);
            ExtentTest test = ExtentTestListener.getTest();
            if (test != null) {
                test.pass("<b>Checkpoint:</b> " + checkpointDescription,
                        MediaEntityBuilder.createScreenCaptureFromBase64String(base64, testId + " - " + checkpointDescription).build());
            }
        } catch (Exception ignored) {}
    }

    protected void captureFail(String testId) {
        ScreenshotUtil.captureScreenshot(driver, testId, "FAIL");
    }

    protected void clearAuthSession() {
        try {
            ((JavascriptExecutor) driver).executeScript(
                    "window.localStorage.clear(); window.sessionStorage.clear();"
            );
            driver.manage().deleteAllCookies();
        } catch (Exception ignored) {}
    }
}
