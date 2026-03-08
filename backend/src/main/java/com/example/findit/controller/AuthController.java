package com.example.findit.controller;

import com.example.findit.model.User;
import com.example.findit.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;
    public AuthController(UserService userService) { this.userService = userService; }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        LOGGER.info("BEGIN AuthController.register username={}", user != null ? user.getUsername() : null);
        // naive: check existing username
        if (userService.findByUsername(user.getUsername()).isPresent()) {
            LOGGER.info("END AuthController.register status=bad_request reason=username_exists username={}", user.getUsername());
            return ResponseEntity.badRequest().body(Map.of("error","Username exists"));
        }
        User saved = userService.register(user);
        LOGGER.info("END AuthController.register status=ok userId={}", saved.getId());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> creds) {
        String username = creds.get("username");
        String password = creds.get("password");
        LOGGER.info("BEGIN AuthController.login username={}", username);
        Optional<User> u = userService.findByUsername(username);
        if (u.isPresent() && u.get().getPassword().equals(password)) {
            LOGGER.info("END AuthController.login status=ok userId={}", u.get().getId());
            return ResponseEntity.ok(u.get());
        }
        LOGGER.info("END AuthController.login status=unauthorized username={}", username);
        return ResponseEntity.status(401).body(Map.of("error","Invalid credentials"));
    }
}
