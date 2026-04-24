package com.crystalbeats.service;

import com.crystalbeats.config.JwtTokenProvider;
import com.crystalbeats.dto.*;
import com.crystalbeats.entity.Role;
import com.crystalbeats.entity.User;
import com.crystalbeats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.UUID;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;

@Service
public class AuthService {

    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider jwtProvider;

    @Value("${google.client.id}")
    private String googleClientId;

    // Cached verifier — built once on first use, not on every login
    private GoogleIdTokenVerifier googleVerifier;

    private GoogleIdTokenVerifier getGoogleVerifier() {
        if (googleVerifier == null) {
            googleVerifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
        }
        return googleVerifier;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken.");

        // First user ever becomes PRIMARY_ADMIN
        Role role = userRepo.count() == 0 ? Role.PRIMARY_ADMIN : Role.USER;

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .avatar("https://api.dicebear.com/7.x/initials/svg?seed=" + req.getUsername())
                .build();

        userRepo.save(user);
        String token = jwtProvider.generateToken(user.getUsername(), role.name());
        return new AuthResponse(token, toDto(user));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid username or password.");

        String token = jwtProvider.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, toDto(user));
    }

    public AuthResponse googleLogin(GoogleAuthRequest req) {
        try {
            GoogleIdToken idToken = getGoogleVerifier().verify(req.getCredential());
            if (idToken != null) {
                Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");

                User user = userRepo.findByUsername(email).orElse(null);

                if (user == null) {
                    // First user ever becomes PRIMARY_ADMIN
                    Role role = userRepo.count() == 0 ? Role.PRIMARY_ADMIN : Role.USER;
                    
                    user = User.builder()
                            .username(email)
                            // Generate random password for google users
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .role(role)
                            .avatar(pictureUrl != null ? pictureUrl : "https://api.dicebear.com/7.x/initials/svg?seed=" + email)
                            .build();
                    userRepo.save(user);
                }

                String token = jwtProvider.generateToken(user.getUsername(), user.getRole().name());
                return new AuthResponse(token, toDto(user));

            } else {
                throw new RuntimeException("Invalid Google ID token.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    public List<UserDto> getAllUsers() {
        return userRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto updateRole(Long userId, String newRole) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getRole() == Role.PRIMARY_ADMIN)
            throw new RuntimeException("Cannot change Primary Admin role.");

        user.setRole(Role.valueOf(newRole));
        userRepo.save(user);
        return toDto(user);
    }

    public UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.getAvatar(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null
        );
    }
}
