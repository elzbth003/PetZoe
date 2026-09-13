package com.petzoe.api.util;

/**
 * Shared manual-validation helpers for fields not covered by Bean Validation
 * (base64 document/image uploads stored as plain TEXT columns with no
 * database-level size limit).
 */
public final class ValidationUtils {

    /** ~5MB of raw file data once base64-decoded (base64 is ~4/3 the original size). */
    private static final int MAX_BASE64_LENGTH = 7_000_000;

    private static final java.util.Set<String> ALLOWED_MIME_TYPES = java.util.Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf"
    );

    private ValidationUtils() {}

    /** Throws if the base64 string is present but exceeds the allowed size or has an invalid/dangerous MIME type. */
    public static void requireBase64WithinLimit(String base64, String fieldName) {
        if (base64 == null || base64.isBlank()) {
            return;
        }

        if (base64.length() > MAX_BASE64_LENGTH) {
            throw new IllegalArgumentException(fieldName + " is too large. Please upload a file under 5MB.");
        }

        // Validate data URI MIME type if prefix is present
        if (base64.startsWith("data:")) {
            int semiIndex = base64.indexOf(";base64,");
            if (semiIndex != -1) {
                String mimeType = base64.substring(5, semiIndex).toLowerCase().trim();
                if (!ALLOWED_MIME_TYPES.contains(mimeType)) {
                    throw new IllegalArgumentException(fieldName + " has an unsupported file format (" + mimeType + "). Allowed formats: JPG, PNG, WEBP, GIF, PDF.");
                }
                String payload = base64.substring(semiIndex + 8);
                if (payload.isBlank()) {
                    throw new IllegalArgumentException(fieldName + " file payload cannot be empty.");
                }
            } else {
                throw new IllegalArgumentException(fieldName + " is not a valid base64 encoded data URI.");
            }
        }
    }
}
