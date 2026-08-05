package com.petzoe.api.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service responsible for generating and validating JSON Web Tokens (JWT).
 * This service handles the creation of tokens upon successful login,
 * and the extraction/validation of tokens during subsequent API requests.
 */
@Service
public class JwtService {

    // The secret key used to sign the JWT. Loaded from application.properties
    @Value("${petzoe.jwt.secret}")
    private String secretKey;

    // The expiration time for the JWT in milliseconds. Loaded from application.properties
    @Value("${petzoe.jwt.expiration}")
    private long jwtExpiration;

    /**
     * Extracts the username (email) from the given JWT.
     * @param token the JWT
     * @return the username
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Generic method to extract a specific claim from the JWT.
     * @param token the JWT
     * @param claimsResolver a function to apply to the claims
     * @param <T> the type of the claim
     * @return the extracted claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generates a JWT for the given UserDetails without any extra claims.
     * Automatically adds custom claims if the user is an instance of our User entity.
     * @param userDetails the user details
     * @return the generated JWT string
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        // If the user details is our custom User entity, embed their role and name into the token
        if (userDetails instanceof com.petzoe.api.entity.User) {
            claims.put("role", ((com.petzoe.api.entity.User) userDetails).getRole());
            claims.put("name", ((com.petzoe.api.entity.User) userDetails).getName());
        }
        
        return generateToken(claims, userDetails);
    }

    /**
     * Generates a JWT for the given UserDetails with extra claims.
     * @param extraClaims a map of extra claims to include in the token payload
     * @param userDetails the user details
     * @return the generated JWT string
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .setClaims(extraClaims) // Set custom data (like role, name)
                .setSubject(userDetails.getUsername()) // Set the main identifier (email)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Set token creation time
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration)) // Set expiration time
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Sign the token with our secret key
                .compact(); // Build the token into a string
    }

    /**
     * Checks if a given token is valid for a specific user.
     * @param token the JWT
     * @param userDetails the user details to validate against
     * @return true if the token is valid, false otherwise
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // The token is valid if the username matches and the token hasn't expired yet
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Checks if the token has expired.
     * @param token the JWT
     * @return true if expired
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extracts the expiration date from the JWT.
     * @param token the JWT
     * @return the expiration date
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Parses the JWT and extracts all claims (the payload).
     * It uses the secret signing key to verify the token hasn't been tampered with.
     * @param token the JWT
     * @return the parsed claims
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Decodes the Base64 secret key and generates an HMAC SHA cryptographic key.
     * @return the signing key
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
