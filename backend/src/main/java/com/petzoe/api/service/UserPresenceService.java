package com.petzoe.api.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory service tracking real-time user online presence and activity.
 */
@Service
public class UserPresenceService {

    // Threshold of inactivity to consider a user offline (e.g. 60 seconds)
    private static final Duration ONLINE_THRESHOLD = Duration.ofSeconds(60);

    // Keyed by lowercased email
    private final Map<String, Instant> emailLastSeen = new ConcurrentHashMap<>();
    // Keyed by user ID
    private final Map<Long, Instant> idLastSeen = new ConcurrentHashMap<>();

    public void recordActivity(Long userId, String email) {
        Instant now = Instant.now();
        if (userId != null) {
            idLastSeen.put(userId, now);
        }
        if (email != null && !email.trim().isEmpty()) {
            emailLastSeen.put(email.trim().toLowerCase(), now);
        }
    }

    public void recordActivityByEmail(String email) {
        if (email != null && !email.trim().isEmpty()) {
            emailLastSeen.put(email.trim().toLowerCase(), Instant.now());
        }
    }

    public void setOffline(Long userId, String email) {
        if (userId != null) {
            idLastSeen.remove(userId);
        }
        if (email != null && !email.trim().isEmpty()) {
            emailLastSeen.remove(email.trim().toLowerCase());
        }
    }

    public boolean isUserOnline(Long userId, String email) {
        Instant now = Instant.now();
        if (userId != null) {
            Instant last = idLastSeen.get(userId);
            if (last != null && Duration.between(last, now).compareTo(ONLINE_THRESHOLD) <= 0) {
                return true;
            }
        }
        if (email != null && !email.trim().isEmpty()) {
            Instant last = emailLastSeen.get(email.trim().toLowerCase());
            if (last != null && Duration.between(last, now).compareTo(ONLINE_THRESHOLD) <= 0) {
                return true;
            }
        }
        return false;
    }

    public Instant getLastSeen(Long userId, String email) {
        if (userId != null && idLastSeen.containsKey(userId)) {
            return idLastSeen.get(userId);
        }
        if (email != null && !email.trim().isEmpty()) {
            return emailLastSeen.get(email.trim().toLowerCase());
        }
        return null;
    }
}
