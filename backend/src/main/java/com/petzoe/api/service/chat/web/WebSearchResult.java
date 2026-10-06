package com.petzoe.api.service.chat.web;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class WebSearchResult {

    private String title;
    private String url;
    private String domain;
    private String snippet;
    private String publicationDate;
    private String retrievedAt;
    private String trustStatus; // "TRUSTED", "ALLOWED", "BLOCKED", "UNKNOWN"
    private String providerType; // "LIVE_WEB", "CURATED_REFERENCE"

    public WebSearchResult() {
        this.retrievedAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    public WebSearchResult(String title, String url, String domain, String snippet, 
                           String publicationDate, String retrievedAt, String trustStatus, 
                           String providerType) {
        this.title = title;
        this.url = url;
        this.domain = domain;
        this.snippet = snippet;
        this.publicationDate = publicationDate;
        this.retrievedAt = (retrievedAt != null) ? retrievedAt : LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        this.trustStatus = trustStatus;
        this.providerType = providerType;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public String getPublicationDate() { return publicationDate; }
    public void setPublicationDate(String publicationDate) { this.publicationDate = publicationDate; }

    public String getRetrievedAt() { return retrievedAt; }
    public void setRetrievedAt(String retrievedAt) { this.retrievedAt = retrievedAt; }

    public String getTrustStatus() { return trustStatus; }
    public void setTrustStatus(String trustStatus) { this.trustStatus = trustStatus; }

    public String getProviderType() { return providerType; }
    public void setProviderType(String providerType) { this.providerType = providerType; }
}
