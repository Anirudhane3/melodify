package com.crystalbeats.controller;

import com.crystalbeats.dto.AuthResponse;
import com.crystalbeats.dto.LoginRequest;
import com.crystalbeats.dto.RegisterRequest;
import com.crystalbeats.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody com.crystalbeats.dto.GoogleAuthRequest req) {
        return ResponseEntity.ok(authService.googleLogin(req));
    }
}
