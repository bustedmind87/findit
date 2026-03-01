package com.example.findit.controller;

import com.example.findit.model.User;
import com.example.findit.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    public AuthController(UserService userService) { this.userService = userService; }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // naive: check existing username
        if (userService.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error","Username exists"));
        }
        User saved = userService.register(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> creds) {
        String username = creds.get("username");
        String password = creds.get("password");
        Optional<User> u = userService.findByUsername(username);
        if (u.isPresent() && u.get().getPassword().equals(password)) {
            return ResponseEntity.ok(u.get());
        }
        return ResponseEntity.status(401).body(Map.of("error","Invalid credentials"));
    }
}
