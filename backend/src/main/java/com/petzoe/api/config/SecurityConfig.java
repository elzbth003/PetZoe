package com.petzoe.api.config;

import com.petzoe.api.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security Configuration for the PetZoe API.
 * This class configures Spring Security to use JWT-based authentication
 * instead of stateful sessions, and sets up CORS for the frontend React app.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserRepository userRepository;
    private final JwtAuthenticationFilter jwtAuthFilter;

    /**
     * Constructor for Dependency Injection.
     * @param userRepository the repository to fetch user data
     * @param jwtAuthFilter the custom filter that intercepts requests to validate JWTs
     */
    public SecurityConfig(UserRepository userRepository, @Lazy JwtAuthenticationFilter jwtAuthFilter) {
        this.userRepository = userRepository;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    /**
     * Provides the mechanism to load a user by their email address during authentication.
     * @return UserDetailsService instance
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    /**
     * Configures the DAO authentication provider to use our custom UserDetailsService and PasswordEncoder.
     * @return AuthenticationProvider instance
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Exposes the AuthenticationManager as a Bean so it can be used in controllers (e.g., AuthController).
     * @param config the authentication configuration
     * @return AuthenticationManager instance
     * @throws Exception if an error occurs
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Provides the BCrypt password encoder to securely hash and verify passwords.
     * @return PasswordEncoder instance
     */
    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures the core security filter chain.
     * Disables CSRF (since we use JWTs), configures endpoints, and adds the JWT filter.
     * @param http the HttpSecurity builder
     * @return the configured SecurityFilterChain
     * @throws Exception if an error occurs
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS using the configuration source defined below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Disable CSRF because we are using stateless JWT authentication
                .csrf(AbstractHttpConfigurer::disable)
                // Configure route access rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // Open login/register/google endpoints
                        .requestMatchers("/error").permitAll()       // Open error endpoint
                        // Marketplace: allow public browsing of products and categories
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/marketplace/products/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/marketplace/categories/**").permitAll()
                        // Vets: allow public browsing of veterinarians
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vets/**").permitAll()
                        // Adoption: allow public browsing of approved adoption listings
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/adoption/**").permitAll()
                        // Rehome: allow public browsing of active rehoming board listings
                        .requestMatchers("/api/rehome/listings/my").authenticated()
                        .requestMatchers("/api/rehome/applications/my").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/rehome/listings/**").permitAll()
                        // Uploads: allow public access to uploaded images
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/uploads/**").permitAll()
                        // Admin: restricted to ADMIN role
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()                // Secure everything else
                )
                // Set session management to stateless (no server-side sessions)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // Register the authentication provider
                .authenticationProvider(authenticationProvider())
                // Add our custom JWT filter BEFORE the standard username/password filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configures Cross-Origin Resource Sharing (CORS) settings.
     * Allows the frontend React app (localhost:5173) to communicate with this backend.
     * @return CorsConfigurationSource instance
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow the React frontend (Vite falls back to 5174+ if 5173 is already in use)
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        // Allow standard HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Allow specific headers required for JWT
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        // Expose the Authorization header so the client can read the token if sent in headers
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        
        // Apply this configuration to all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
