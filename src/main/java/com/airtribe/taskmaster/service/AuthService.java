package com.airtribe.taskmaster.service;

import com.airtribe.taskmaster.dto.request.LoginRequest;
import com.airtribe.taskmaster.dto.request.RegisterRequest;
import com.airtribe.taskmaster.dto.response.AuthResponse;
import com.airtribe.taskmaster.dto.response.UserResponse;
import com.airtribe.taskmaster.entity.User;
import com.airtribe.taskmaster.exception.ConflictException;
import com.airtribe.taskmaster.repository.UserRepository;
import com.airtribe.taskmaster.security.JwtService;
import com.airtribe.taskmaster.security.TokenBlacklist;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles registration, login and logout.
 *
 * Passwords are hashed with BCrypt before persistence and never stored or
 * returned in plain text. On success a signed JWT is returned for the client
 * to send on subsequent requests.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklist tokenBlacklist;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, TokenBlacklist tokenBlacklist) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenBlacklist = tokenBlacklist;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new ConflictException("Username is already taken");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFullName(req.fullName());
        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getUsername());
        return new AuthResponse(token, UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        // Allow logging in with either username or email.
        User user = userRepository.findByUsername(req.usernameOrEmail())
                .or(() -> userRepository.findByEmail(req.usernameOrEmail()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername());
        return new AuthResponse(token, UserResponse.from(user));
    }

    /** Revoke the presented token so it can no longer be used. */
    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            tokenBlacklist.revoke(token);
        }
    }
}
