package com.petzoe.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final com.petzoe.api.service.UserPresenceService userPresenceService;

    public JwtAuthenticationFilter(JwtService jwtService, 
                                   UserDetailsService userDetailsService,
                                   com.petzoe.api.service.UserPresenceService userPresenceService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userPresenceService = userPresenceService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            userEmail = jwtService.extractUsername(jwt);
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                if (!userDetails.isEnabled()) {
                    throw new org.springframework.security.authentication.DisabledException("Account is disabled");
                }
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    userPresenceService.recordActivityByEmail(userEmail);
                }
            } else if (userEmail != null) {
                userPresenceService.recordActivityByEmail(userEmail);
            }
        } catch (org.springframework.security.authentication.DisabledException e) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Your PetZoe account has been deactivated. Please contact the administrator.\"}");
            return;
        } catch (Exception e) {
            // Token parsing or signature issues are swallowed here so filter chain proceeds,
            // resulting in a 401/403 downstream for protected routes.
        }

        filterChain.doFilter(request, response);
    }
}
