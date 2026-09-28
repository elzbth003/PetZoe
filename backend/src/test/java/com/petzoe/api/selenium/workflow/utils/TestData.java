package com.petzoe.api.selenium.workflow.utils;

/**
 * Centralized test accounts and configuration constants.
 * Uses dedicated pre-seeded test accounts from DatabaseInitializer.
 */
public class TestData {
    public static final String BASE_URL = System.getProperty("app.url", "http://localhost:5173");

    // Pre-seeded Pet Owner account
    public static final String OWNER_EMAIL = "owner@petverse.com";
    public static final String OWNER_PASSWORD = "Password123!";
    public static final String OWNER_NAME = "Alex Carter";

    // Pre-seeded Veterinarian account
    public static final String VET_EMAIL = "vet@petverse.com";
    public static final String VET_PASSWORD = "Password123!";
    public static final String VET_NAME = "Dr. Sarah Jenkins";

    // Pre-seeded Admin account
    public static final String ADMIN_EMAIL = "admin@petverse.com";
    public static final String ADMIN_PASSWORD = "Password123!";
    public static final String ADMIN_NAME = "System Administrator";

    // Pre-seeded Shelter Manager account
    public static final String SHELTER_EMAIL = "shelter@petverse.com";
    public static final String SHELTER_PASSWORD = "Password123!";
    public static final String SHELTER_NAME = "Emma Watson";

    // Pre-seeded Marketplace Seller account
    public static final String SELLER_EMAIL = "seller@petverse.com";
    public static final String SELLER_PASSWORD = "Password123!";
    public static final String SELLER_NAME = "PetZoe Official Store";

    // Invalid Credentials for Negative Testing
    public static final String INVALID_EMAIL = "nonexistent.user@example.com";
    public static final String INVALID_PASSWORD = "WrongPassword999!";

    // Dynamic Pet Registration Test Data
    public static final String NEW_PET_NAME = "Selenium Bruno";
    public static final String NEW_PET_BREED = "Golden Retriever";
    public static final String NEW_PET_AGE = "3";
    public static final String NEW_PET_WEIGHT = "26.5";

    // Dynamic Test Assets for File Uploads
    public static final String TEST_IMAGE_PATH = new java.io.File("src/test/resources/test-image.png").getAbsolutePath();
    public static final String TEST_DOC_PATH = new java.io.File("src/test/resources/test-doc.pdf").getAbsolutePath();
}
