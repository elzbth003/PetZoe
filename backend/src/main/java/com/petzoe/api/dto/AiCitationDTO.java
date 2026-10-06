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
    private String providerType; // "LIVE_WEB", "CURATED_REFERENCE"

    public AiCitationDTO() {
        this.retrievedAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    public AiCitationDTO(int index, String title, String domain, String url, 
                         String publicationDate, String retrievedAt, String snippet, 
                         String trustStatus, String providerType) {
        this.index = index;
        this.title = title;
        this.domain = domain;
        this.url = url;
        this.publicationDate = publicationDate;
        this.retrievedAt = (retrievedAt != null) ? retrievedAt : LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        this.snippet = snippet;
        this.trustStatus = trustStatus;
        this.providerType = providerType;
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
}
