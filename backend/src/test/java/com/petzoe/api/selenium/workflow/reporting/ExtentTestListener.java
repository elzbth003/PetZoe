package com.petzoe.api.selenium.workflow.reporting;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.markuputils.ExtentColor;
import com.aventstack.extentreports.markuputils.MarkupHelper;
import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.utils.ScreenshotUtil;
import org.junit.jupiter.api.extension.*;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.lang.reflect.Method;
import java.util.Optional;

public class ExtentTestListener implements BeforeEachCallback, AfterEachCallback, TestWatcher, AfterAllCallback {

    private static final ThreadLocal<ExtentTest> testThreadLocal = new ThreadLocal<>();

    public static ExtentTest getTest() {
        return testThreadLocal.get();
    }

    public static void setTest(ExtentTest test) {
        testThreadLocal.set(test);
    }

    @Override
    public void beforeEach(ExtensionContext context) {
        String className = context.getRequiredTestClass().getSimpleName();
        String methodName = context.getRequiredTestMethod().getName();
        String displayName = context.getDisplayName();

        String testId = extractTestId(displayName, methodName);
        String testName = extractTestName(displayName, methodName);
        String module = resolveModule(className);

        ExtentTest test = ExtentManager.getInstance().createTest(
                testId + " - " + testName,
                "<b>Module:</b> " + module + " | <b>Method:</b> " + className + "." + methodName
        );

        test.assignCategory(module);
        test.assignAuthor("PetZoe QA Suite");

        // Attempt to extract dynamic browser capabilities
        WebDriver driver = extractDriver(context);
        if (driver instanceof HasCapabilities) {
            try {
                Capabilities caps = ((HasCapabilities) driver).getCapabilities();
                String browserName = caps.getBrowserName();
                String browserVersion = caps.getBrowserVersion();
                if (browserName != null && !browserName.isEmpty()) {
                    test.assignDevice(browserName + (browserVersion != null ? " " + browserVersion : ""));
                    ExtentManager.updateBrowserInfo(browserName, browserVersion);
                }
            } catch (Exception ignored) {
            }
        }

        testThreadLocal.set(test);
    }

    @Override
    public void testSuccessful(ExtensionContext context) {
        ExtentTest test = testThreadLocal.get();
        if (test != null) {
            test.pass(MarkupHelper.createLabel("TEST EXECUTION PASSED", ExtentColor.GREEN));
        }
    }

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        ExtentTest test = testThreadLocal.get();
        if (test != null) {
            String testId = extractTestId(context.getDisplayName(), context.getRequiredTestMethod().getName());
            WebDriver driver = extractDriver(context);
            String currentUrl = "Unavailable";

            if (driver != null) {
                try {
                    currentUrl = driver.getCurrentUrl();
                } catch (Exception ignored) {}
            }

            test.fail(MarkupHelper.createLabel("TEST EXECUTION FAILED", ExtentColor.RED));
            test.fail("<b>Target URL at Failure:</b> " + currentUrl);
            test.fail("<b>Failure Reason:</b> " + (cause != null ? cause.getMessage() : "Unknown assertion error"));
            if (cause != null) {
                test.fail(cause);
            }

            // Capture screenshot evidence
            if (driver != null) {
                try {
                    // Physical file capture
                    String filePath = ScreenshotUtil.captureScreenshot(driver, testId, "FAIL");

                    // Base64 embedded screenshot for self-contained report
                    String base64 = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BASE64);
                    test.fail("<b>Failure Evidence Screenshot:</b>",
                            MediaEntityBuilder.createScreenCaptureFromBase64String(base64, "Failure Screen").build());
                } catch (Exception e) {
                    test.warning("Could not capture screenshot: " + e.getMessage());
                }
            }
        }
    }

    @Override
    public void testAborted(ExtensionContext context, Throwable cause) {
        ExtentTest test = testThreadLocal.get();
        if (test != null) {
            test.skip(MarkupHelper.createLabel("TEST EXECUTION ABORTED / BLOCKED", ExtentColor.AMBER));
            if (cause != null) {
                test.skip(cause);
            }
        }
    }

    @Override
    public void testDisabled(ExtensionContext context, Optional<String> reason) {
        ExtentTest test = testThreadLocal.get();
        if (test != null) {
            test.skip(MarkupHelper.createLabel("TEST SKIPPED", ExtentColor.GREY));
            test.skip("Reason: " + reason.orElse("No reason provided"));
        }
    }

    @Override
    public void afterEach(ExtensionContext context) {
        ExtentManager.flushReport();
        testThreadLocal.remove();
    }

    @Override
    public void afterAll(ExtensionContext context) {
        ExtentManager.flushReport();
    }

    private WebDriver extractDriver(ExtensionContext context) {
        try {
            Object testInstance = context.getTestInstance().orElse(null);
            if (testInstance instanceof BaseTest) {
                return ((BaseTest) testInstance).getDriver();
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private String extractTestId(String displayName, String methodName) {
        if (displayName != null && displayName.contains(":")) {
            return displayName.split(":")[0].trim();
        }
        if (methodName.startsWith("test")) {
            return methodName;
        }
        return "TC-" + methodName.toUpperCase();
    }

    private String extractTestName(String displayName, String methodName) {
        if (displayName != null && displayName.contains(":")) {
            return displayName.substring(displayName.indexOf(":") + 1).trim();
        }
        return displayName != null ? displayName : methodName;
    }

    private String resolveModule(String className) {
        if (className.contains("Auth")) return "Authentication";
        if (className.contains("PetManagement") || className.contains("PetIdCentric")) return "Pet Management";
        if (className.contains("PetHealth") || className.contains("Medical")) return "Medical Records";
        if (className.contains("Appointment")) return "Appointment";
        if (className.contains("Rehoming")) return "Rehoming";
        if (className.contains("Admin")) return "Administration";
        if (className.contains("Validation")) return "Validation";
        if (className.contains("Shelter")) return "Shelter Management";
        if (className.contains("Seller")) return "Seller Management";
        if (className.contains("Marketplace")) return "Marketplace";
        if (className.contains("Vet")) return "Veterinary Care";
        if (className.contains("RoleSecurity") || className.contains("Security")) return "Role Security";
        return "Selenium UI";
    }
}
