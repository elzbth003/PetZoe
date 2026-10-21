package com.petzoe.api.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    private static final Logger log = LoggerFactory.getLogger(RazorpayConfig.class);

    @Value("${petzoe.razorpay.key-id}")
    private String keyId;

    @Value("${petzoe.razorpay.key-secret:}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() {
        try {
            if (keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank()) {
                log.info("Initializing RazorpayClient with keyId: {}", keyId);
                return new RazorpayClient(keyId, keySecret);
            }
            log.warn("Razorpay credentials not fully configured; creating fallback stub client.");
            return new RazorpayClient("rzp_test_placeholder", "placeholder_secret");
        } catch (RazorpayException e) {
            log.warn("Could not initialize RazorpayClient: {}", e.getMessage());
            try {
                return new RazorpayClient("rzp_test_placeholder", "placeholder_secret");
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
