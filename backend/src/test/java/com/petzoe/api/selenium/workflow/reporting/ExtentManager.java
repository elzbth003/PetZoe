package com.petzoe.api.selenium.workflow.reporting;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ExtentManager {

    private static volatile ExtentReports extent;
    private static final String REPORT_DIR_NAME = "selenium-reports";
    private static final String REPORT_FILE_NAME = "PetZoe-Selenium-Report.html";
    private static Path primaryReportPath;

    public static synchronized ExtentReports getInstance() {
        if (extent == null) {
            extent = createInstance();
        }
        return extent;
    }

    private static ExtentReports createInstance() {
        // Resolve directory based on working directory
        Path currentDir = Paths.get(".").toAbsolutePath().normalize();
        Path reportDir;
        if (currentDir.endsWith("backend")) {
            reportDir = currentDir.resolve("target").resolve(REPORT_DIR_NAME);
        } else {
            reportDir = currentDir.resolve("backend").resolve("target").resolve(REPORT_DIR_NAME);
        }

        try {
            Files.createDirectories(reportDir);
        } catch (IOException e) {
            System.err.println("Could not create report directory: " + e.getMessage());
        }

        primaryReportPath = reportDir.resolve(REPORT_FILE_NAME);
        File reportFile = primaryReportPath.toFile();

        ExtentSparkReporter spark = new ExtentSparkReporter(reportFile);
        spark.config().setDocumentTitle("PetZoe - Selenium WebDriver Automation Report");
        spark.config().setReportName("Selenium Functional UI Test Execution");
        spark.config().setTheme(Theme.STANDARD);
        spark.config().setTimeStampFormat("EEEE, MMMM dd, yyyy, hh:mm:ss a '('zzz')'");
        spark.config().setEncoding("utf-8");

        ExtentReports report = new ExtentReports();
        report.attachReporter(spark);

        // System / Environment Information
        report.setSystemInfo("Project", "PetZoe");
        report.setSystemInfo("Testing Type", "Selenium WebDriver Functional UI Testing");
        report.setSystemInfo("Automation Framework", "Selenium WebDriver (Java)");
        report.setSystemInfo("Test Framework", "JUnit 5 (Jupiter)");
        report.setSystemInfo("Build Tool", "Apache Maven");
        report.setSystemInfo("Operating System", System.getProperty("os.name") + " (" + System.getProperty("os.arch") + ")");
        report.setSystemInfo("Java Version", System.getProperty("java.version"));
        report.setSystemInfo("Execution Date", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        report.setSystemInfo("Application Base URL", System.getProperty("app.url", "http://localhost:5173"));
        report.setSystemInfo("Target Scope", "20% Risk-Based Functional Scope (Core Workflows)");

        // JVM Shutdown hook to flush
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            flushReport();
        }));

        System.out.println("[EXTENT REPORTS] Initialized Spark reporter at: " + primaryReportPath.toAbsolutePath());
        return report;
    }

    public static synchronized void updateBrowserInfo(String browserName, String browserVersion) {
        if (extent != null && browserName != null) {
            extent.setSystemInfo("Browser", browserName);
            if (browserVersion != null) {
                extent.setSystemInfo("Browser Version", browserVersion);
            }
        }
    }

    public static synchronized void flushReport() {
        if (extent != null) {
            try {
                extent.flush();
                syncMirrors();
            } catch (Exception e) {
                System.err.println("Error flushing ExtentReports: " + e.getMessage());
            }
        }
    }

    private static void syncMirrors() {
        if (primaryReportPath == null || !Files.exists(primaryReportPath)) {
            return;
        }
        try {
            // Also mirror to project root target/selenium-reports if possible
            Path rootTarget = Paths.get("..", "target", REPORT_DIR_NAME).toAbsolutePath().normalize();
            if (!rootTarget.equals(primaryReportPath.getParent())) {
                Files.createDirectories(rootTarget);
                Files.copy(primaryReportPath, rootTarget.resolve(REPORT_FILE_NAME), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (Exception ignored) {
        }
    }

    public static Path getReportPath() {
        return primaryReportPath;
    }
}
