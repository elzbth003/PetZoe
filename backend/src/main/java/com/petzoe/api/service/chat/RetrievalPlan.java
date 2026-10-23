package com.petzoe.api.service.chat;

import java.util.EnumSet;
import java.util.Set;

/**
 * Composable retrieval plan supporting multiple simultaneous evidence sources:
 * - PATIENT_CONTEXT: authorized registered-pet data.
 * - VECTOR_KNOWLEDGE: semantic search over approved veterinary documents.
 * - WEB_KNOWLEDGE: controlled external retrieval when justified.
 * - EMERGENCY_SAFETY: deterministic safety rules.
 * - PLATFORM_HELP: PetZoe application instructions.
 * - DATABASE_RECORDS: general database transaction/listing lookups.
 */
public class RetrievalPlan {

    public enum EvidenceSource {
        PATIENT_CONTEXT,
        VECTOR_KNOWLEDGE,
        WEB_KNOWLEDGE,
        EMERGENCY_SAFETY,
        PLATFORM_HELP,
        DATABASE_RECORDS,
        LIVE_VET_AVAILABILITY
    }

    private final Set<EvidenceSource> sources = EnumSet.noneOf(EvidenceSource.class);
    private RetrievalMode mode = RetrievalMode.NO_RETRIEVAL;
    private String candidatePetName;
    private String statedAge;
    private String statedSpecies;
    private boolean generalQuestion = true;

    public RetrievalPlan() {}

    public RetrievalPlan(RetrievalMode mode) {
        this.mode = mode;
    }

    public void addSource(EvidenceSource source) {
        this.sources.add(source);
    }

    public boolean hasSource(EvidenceSource source) {
        return this.sources.contains(source);
    }

    public Set<EvidenceSource> getSources() {
        return sources;
    }

    public RetrievalMode getMode() {
        return mode;
    }

    public void setMode(RetrievalMode mode) {
        this.mode = mode;
    }

    public String getCandidatePetName() {
        return candidatePetName;
    }

    public void setCandidatePetName(String candidatePetName) {
        this.candidatePetName = candidatePetName;
        if (candidatePetName != null && !candidatePetName.isBlank()) {
            this.generalQuestion = false;
        }
    }

    public String getStatedAge() {
        return statedAge;
    }

    public void setStatedAge(String statedAge) {
        this.statedAge = statedAge;
    }

    public String getStatedSpecies() {
        return statedSpecies;
    }

    public void setStatedSpecies(String statedSpecies) {
        this.statedSpecies = statedSpecies;
    }

    public boolean isGeneralQuestion() {
        return generalQuestion;
    }

    public void setGeneralQuestion(boolean generalQuestion) {
        this.generalQuestion = generalQuestion;
    }
}
