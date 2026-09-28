package com.petzoe.api.selenium.workflow.utils;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ScreenshotUtil {

    private static final Path EVIDENCE_DIR = Paths.get("..", "test-results", "screenshots").toAbsolutePath().normalize();

    static {
        try {
            Files.createDirectories(EVIDENCE_DIR);
        } catch (IOException e) {
            System.err.println("Failed to create evidence directory: " + e.getMessage());
        }
    }

    public static String captureScreenshot(WebDriver driver, String testId, String status) {
        if (driver == null) return null;
        try {
            File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String fileName = String.format("%s-%s-%s.png", testId, status, timestamp);
            Path destPath = EVIDENCE_DIR.resolve(fileName);
            Files.copy(srcFile.toPath(), destPath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("[EVIDENCE CAPTURED] Screenshot saved: " + destPath);
            return destPath.toString();
        } catch (Exception e) {
            System.err.println("Could not capture screenshot for " + testId + ": " + e.getMessage());
            return null;
        }
    }
}
