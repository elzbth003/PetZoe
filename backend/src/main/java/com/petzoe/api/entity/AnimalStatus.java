package com.petzoe.api.entity;

/**
 * Full shelter-animal adoption-readiness lifecycle (spec section 9).
 * Phase 2 (intake) only produces IN_SHELTER_CARE; later phases drive the
 * remaining transitions (medical care, listing, adoption, follow-up).
 */
public enum AnimalStatus {
    IN_SHELTER_CARE,
    UNDER_MEDICAL_CARE,
    MEDICAL_REVIEW,
    AWAITING_DOCUMENTS,
    ADOPTION_REVIEW,
    READY_FOR_ADOPTION,
    ON_HOLD,
    ADOPTION_PENDING,
    ADOPTED,
    WITHDRAWN
}
