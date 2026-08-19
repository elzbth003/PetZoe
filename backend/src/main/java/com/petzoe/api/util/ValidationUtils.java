package com.petzoe.api.util;

/**
 * Shared manual-validation helpers for fields not covered by Bean Validation
 * (base64 document/image uploads stored as plain TEXT columns with no
 * database-level size limit).
 */
public final class ValidationUtils {

    /** ~5MB of raw file data once base64-decoded (base64 is ~4/3 the original size). */
    private static final int MAX_BASE64_LENGTH = 7_000_000;

    private ValidationUtils() {}

    /** Throws if the base64 string is present but exceeds the allowed size. Blank/null values pass through untouched. */
    public static void requireBase64WithinLimit(String base64, String fieldName) {
        if (base64 != null && base64.length() > MAX_BASE64_LENGTH) {
            throw new IllegalArgumentException(fieldName + " is too large. Please upload a file under 5MB.");
        }
    }
}
