package com.petzoe.api.service;

import com.petzoe.api.config.JwtService;
import com.petzoe.api.dto.AuthResponse;
import com.petzoe.api.dto.GoogleLoginRequest;
import com.petzoe.api.dto.LoginRequest;
import com.petzoe.api.dto.RegisterRequest;
import com.petzoe.api.entity.User;
import com.petzoe.api.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    @Value("${petzoe.google.client-id:}")
    private String googleClientId;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuthenticationManager authenticationManager,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.notificationService = notificationService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email().toLowerCase()).isPresent()) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        User user = new User(
                request.name(),
                request.email().toLowerCase(),
                passwordEncoder.encode(request.password()),
                request.phone(),
                request.role()
        );

        User savedUser = userRepository.save(user);
        String jwtToken = jwtService.generateToken(savedUser);

        // Send welcome notification
        notificationService.createNotification(savedUser,
                "Welcome to PetZoe! 🐾",
                "Your account has been created successfully. Start by adding your pets!",
                "SYSTEM");

        return new AuthResponse(jwtToken, savedUser.getEmail(), savedUser.getName(),
                savedUser.getRole(), savedUser.getProfileImage());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().toLowerCase(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email address or password."));

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getEmail(), user.getName(),
                user.getRole(), user.getProfileImage());
    }

    public AuthResponse processGoogleLogin(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(
                            googleClientId.isEmpty() ? "dummy-client-id" : googleClientId))
                    .build();

            GoogleIdToken idToken;
            if (googleClientId.isEmpty()) {
                // Development mode: parse token without strict verification
                idToken = GoogleIdToken.parse(GsonFactory.getDefaultInstance(), request.token());
            } else {
                idToken = verifier.verify(request.token());
                if (idToken == null) {
                    throw new IllegalArgumentException("Invalid Google ID token.");
                }
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail().toLowerCase();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            // Check if user exists by Google ID or email
            Optional<User> existingByGoogle = userRepository.findByGoogleId(googleId);
            Optional<User> existingByEmail = userRepository.findByEmail(email);

            User user;
            boolean isNewUser = false;

            if (existingByGoogle.isPresent()) {
                // Returning Google user
                user = existingByGoogle.get();
                if (pictureUrl != null && user.getProfileImage() == null) {
                    user.setProfileImage(pictureUrl);
                    user = userRepository.save(user);
                }
            } else if (existingByEmail.isPresent()) {
                // Email already registered — link Google account
                user = existingByEmail.get();
                user.setGoogleId(googleId);
                if (pictureUrl != null && user.getProfileImage() == null) {
                    user.setProfileImage(pictureUrl);
                }
                user = userRepository.save(user);
            } else {
                // New user — auto-register as Pet Owner
                user = new User();
                user.setName(name != null ? name : email);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                user.setPhone(null);
                user.setRole("Pet Owner");
                user.setGoogleId(googleId);
                user.setProfileImage(pictureUrl);
                user = userRepository.save(user);
                isNewUser = true;

                notificationService.createNotification(user,
                        "Welcome to PetZoe! 🐾",
                        "Your Google account has been connected. Start by adding your first pet!",
                        "SYSTEM");
            }

            String jwtToken = jwtService.generateToken(user);
            return new AuthResponse(jwtToken, user.getEmail(), user.getName(),
                    user.getRole(), user.getProfileImage());

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Google authentication failed: " + e.getMessage());
        }
    }

    public void forgotPassword(String email) {
        userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("No account registered with this email address."));
        // Simulating email dispatch success
    }
}
