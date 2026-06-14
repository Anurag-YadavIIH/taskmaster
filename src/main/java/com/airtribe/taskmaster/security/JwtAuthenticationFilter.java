package com.airtribe.taskmaster.security;

import com.airtribe.taskmaster.entity.User;
import com.airtribe.taskmaster.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Runs once per request: pulls the Bearer token from the Authorization header,
 * validates it (signature, expiry, not revoked), and if good, populates the
 * SecurityContext so downstream code sees an authenticated user.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final TokenBlacklist tokenBlacklist;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, TokenBlacklist tokenBlacklist,
                                   UserRepository userRepository) {
        this.jwtService = jwtService;
        this.tokenBlacklist = tokenBlacklist;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtService.isValid(token) && !tokenBlacklist.isRevoked(token)) {
                Long userId = jwtService.extractUserId(token);
                User user = userRepository.findById(userId).orElse(null);

                if (user != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserPrincipal principal = new UserPrincipal(user);
                    var authentication = new UsernamePasswordAuthenticationToken(
                            principal, null, principal.getAuthorities());
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
