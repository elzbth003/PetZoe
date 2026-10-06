package com.petzoe.api.service.chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.URI;
import java.net.URL;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Enforces URL safety, domain allowlisting, SSRF protection, and DNS-rebinding prevention.
 */
@Service
public class WebSafetyService {

    private static final Logger log = LoggerFactory.getLogger(WebSafetyService.class);

    private final Set<String> allowedDomains;

    public WebSafetyService(@Value("${petzoe.web.allowed-domains:wsava.org,aaha.org,avma.org,ncbi.nlm.nih.gov,pubmed.ncbi.nlm.nih.gov,vetmed.ucdavis.edu,vet.cornell.edu,cdc.gov,fda.gov}") String allowedDomainsConfig) {
        if (allowedDomainsConfig == null || allowedDomainsConfig.isBlank()) {
            this.allowedDomains = Collections.emptySet();
        } else {
            this.allowedDomains = Arrays.stream(allowedDomainsConfig.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());
        }
    }

    public Set<String> getAllowedDomains() {
        return allowedDomains;
    }

    /**
     * Validates whether a domain is allowed under the configured trusted domain policy.
     */
    public boolean isDomainAllowed(String domain) {
        if (domain == null || domain.isBlank()) return false;
        String normalized = domain.toLowerCase().trim();
        // Remove port if present
        if (normalized.contains(":")) {
            normalized = normalized.substring(0, normalized.indexOf(":"));
        }
        for (String allowed : allowedDomains) {
            if (normalized.equals(allowed) || normalized.endsWith("." + allowed)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Classifies domain into TRUSTED, ALLOWED, BLOCKED, or UNKNOWN.
     */
    public String classifyDomain(String domain) {
        if (domain == null || domain.isBlank()) return "BLOCKED";
        String normalized = domain.toLowerCase().trim();
        if (isPrivateOrLocalhostHost(normalized)) {
            return "BLOCKED";
        }
        if (isDomainAllowed(normalized)) {
            return "TRUSTED";
        }
        return "UNKNOWN";
    }

    /**
     * Comprehensive URL validation: protocol, allowed domain, and DNS-rebinding SSRF checks.
     */
    public boolean isValidAndSafeUrl(String urlString) {
        try {
            if (urlString == null || urlString.isBlank()) return false;

            URI uri = URI.create(urlString);
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                log.warn("Blocked URL with disallowed scheme: {}", scheme);
                return false;
            }

            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                return false;
            }

            // Check localhost/private hostname
            if (isPrivateOrLocalhostHost(host)) {
                log.warn("Blocked private or localhost host: {}", host);
                return false;
            }

            // Check domain allowlist
            if (!isDomainAllowed(host)) {
                log.warn("Blocked domain not in allowlist: {}", host);
                return false;
            }

            // DNS resolution check to prevent SSRF and DNS rebinding
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress addr : addresses) {
                if (isPrivateOrRestrictedIp(addr)) {
                    log.warn("SSRF / DNS-Rebinding blocked: host {} resolved to restricted IP {}", host, addr.getHostAddress());
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            log.warn("Failed URL validation for {}: {}", urlString, e.getMessage());
            return false;
        }
    }

    public boolean isPrivateOrLocalhostHost(String host) {
        if (host == null) return true;
        String h = host.toLowerCase().trim();
        return h.equals("localhost") ||
                h.equals("127.0.0.1") ||
                h.equals("0.0.0.0") ||
                h.equals("::1") ||
                h.equals("metadata.google.internal") ||
                h.equals("169.254.169.254") ||
                h.endsWith(".local") ||
                h.endsWith(".internal");
    }

    public boolean isPrivateOrRestrictedIp(InetAddress address) {
        if (address == null) return true;
        if (address.isLoopbackAddress()) return true;
        if (address.isAnyLocalAddress()) return true;
        if (address.isLinkLocalAddress()) return true;
        if (address.isSiteLocalAddress()) return true; // 10.x.x.x, 172.16.x.x - 172.31.x.x, 192.168.x.x
        if (address.isMulticastAddress()) return true;

        byte[] ip = address.getAddress();
        if (ip.length == 4) {
            int b0 = ip[0] & 0xFF;
            int b1 = ip[1] & 0xFF;

            // 127.0.0.0/8 (Loopback)
            if (b0 == 127) return true;
            // 10.0.0.0/8 (Private)
            if (b0 == 10) return true;
            // 172.16.0.0/12 (Private)
            if (b0 == 172 && (b1 >= 16 && b1 <= 31)) return true;
            // 192.168.0.0/16 (Private)
            if (b0 == 192 && b1 == 168) return true;
            // 169.254.0.0/16 (Link Local / Cloud Metadata)
            if (b0 == 169 && b1 == 254) return true;
            // 100.64.0.0/10 (Carrier-grade NAT)
            if (b0 == 100 && (b1 >= 64 && b1 <= 127)) return true;
            // 0.0.0.0/8
            if (b0 == 0) return true;
        }

        return false;
    }
}
