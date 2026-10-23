package com.petzoe.api.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class AiCitationDTO {

    private int index;
    private String title;
    private String domain;
    private String url;
    private String publicationDate;
    private String retrievedAt;
    private String snippet;
    private String trustStatus; // "TRUSTED", "ALLOWED", "UNKNOWN", "BLOCKED"
    private String providerType; // "LIVE_WEB", "CURATED_REFERENCE", "VECTOR_PG", "PLATFORM_DB"
    private String evidenceType = "OFFICIAL_GUIDELINE"; // "OFFICIAL_GUIDELINE", "PEER_REVIEWED_STUDY", "PLATFORM_DATA", "CURATED_REFERENCE"
    private String citationStatus = "RETRIEVED_BACKGROUND"; // "RETRIEVED_BACKGROUND", "CITED_IN_RESPONSE", "SUPPORTS_CLAIM"
    private boolean isReferencedInResponse = false;
    private String species;
    private String clinicalTopic;
    private String license;
    private String doi;

    public AiCitationDTO() {
        this.retrievedAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    public AiCitationDTO(int index, String title, String domain, String url, 
                         String publicationDate, String retrievedAt, String snippet, 
                         String trustStatus, String providerType) {
        this(index, title, domain, url, publicationDate, retrievedAt, snippet, trustStatus, providerType,
             "CURATED_REFERENCE", "RETRIEVED_BACKGROUND", false, null, null, null, null);
    }

    public AiCitationDTO(int index, String title, String domain, String url, 
                         String publicationDate, String retrievedAt, String snippet, 
                         String trustStatus, String providerType, String evidenceType) {
        this(index, title, domain, url, publicationDate, retrievedAt, snippet, trustStatus, providerType,
             evidenceType, "RETRIEVED_BACKGROUND", false, null, null, null, null);
    }

    public AiCitationDTO(int index, String title, String domain, String url, 
                         String publicationDate, String retrievedAt, String snippet, 
                         String trustStatus, String providerType, String evidenceType,
                         String citationStatus, boolean isReferencedInResponse,
                         String species, String clinicalTopic, String license, String doi) {
        this.index = index;
        this.title = title;
        this.domain = domain;
        this.url = url;
        this.publicationDate = publicationDate;
        this.retrievedAt = (retrievedAt != null) ? retrievedAt : LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        this.snippet = snippet;
        this.trustStatus = trustStatus;
        this.providerType = providerType;
        this.evidenceType = (evidenceType != null) ? evidenceType : "OFFICIAL_GUIDELINE";
        this.citationStatus = (citationStatus != null) ? citationStatus : "RETRIEVED_BACKGROUND";
        this.isReferencedInResponse = isReferencedInResponse;
        this.species = species;
        this.clinicalTopic = clinicalTopic;
        this.license = license;
        this.doi = doi;
    }

    public int getIndex() { return index; }
    public void setIndex(int index) { this.index = index; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getPublicationDate() { return publicationDate; }
    public void setPublicationDate(String publicationDate) { this.publicationDate = publicationDate; }

    public String getRetrievedAt() { return retrievedAt; }
    public void setRetrievedAt(String retrievedAt) { this.retrievedAt = retrievedAt; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public String getTrustStatus() { return trustStatus; }
    public void setTrustStatus(String trustStatus) { this.trustStatus = trustStatus; }

    public String getProviderType() { return providerType; }
    public void setProviderType(String providerType) { this.providerType = providerType; }

    public String getEvidenceType() { return evidenceType; }
    public void setEvidenceType(String evidenceType) { this.evidenceType = evidenceType; }

    public String getCitationStatus() { return citationStatus; }
    public void setCitationStatus(String citationStatus) { this.citationStatus = citationStatus; }

    public boolean isReferencedInResponse() { return isReferencedInResponse; }
    public void setReferencedInResponse(boolean isReferencedInResponse) { this.isReferencedInResponse = isReferencedInResponse; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getClinicalTopic() { return clinicalTopic; }
    public void setClinicalTopic(String clinicalTopic) { this.clinicalTopic = clinicalTopic; }

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }
}
