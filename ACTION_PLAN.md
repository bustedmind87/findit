# FindIt Integration - Action Plan & Code Fixes

## Priority 1: File Upload Handler (CRITICAL)

### Backend Fix: ItemsController.java

Replace the POST method:

```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<Item> create(
    @RequestPart(value = "item") String itemJson,
    @RequestPart(value = "photos", required = false) List<MultipartFile> photos) throws IOException {
    
    try {
        // Parse item JSON from blob
        ObjectMapper mapper = new ObjectMapper();
        Item item = mapper.readValue(itemJson, Item.class);
        item.setStatus("PENDING");
        
        // Save item first
        Item savedItem = itemService.save(item);
        
        // Handle file uploads if present
        if (photos != null && !photos.isEmpty()) {
            fileStorageService.saveFiles(savedItem.getId(), photos);
        }
        
        return ResponseEntity.ok(savedItem);
    } catch (Exception e) {
        return ResponseEntity.badRequest().build();
    }
}
```

### New Service: FileStorageService.java

Create a new file at `backend/src/main/java/com/example/findit/service/FileStorageService.java`:

```java
package com.example.findit.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public List<String> saveFiles(Long itemId, List<MultipartFile> files) throws IOException {
        List<String> fileNames = new ArrayList<>();
        
        Path itemPath = Paths.get(uploadDir, "items", itemId.toString());
        Files.createDirectories(itemPath);
        
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            
            String originalName = file.getOriginalFilename();
            String extension = originalName != null ? originalName.substring(originalName.lastIndexOf(".")) : ".jpg";
            String uniqueName = UUID.randomUUID() + extension;
            
            Path filePath = itemPath.resolve(uniqueName);
            Files.write(filePath, file.getBytes());
            
            fileNames.add("/api/files/items/" + itemId + "/" + uniqueName);
        }
        
        return fileNames;
    }

    public byte[] getFile(Long itemId, String filename) throws IOException {
        Path filePath = Paths.get(uploadDir, "items", itemId.toString(), filename);
        return Files.readAllBytes(filePath);
    }
}
```

### Add Dependencies to pom.xml

Add to `<dependencies>`:

```xml
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.11.0</version>
</dependency>
```

### Required Imports in ItemsController.java

```java
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
```

---

## Priority 2: Date Serialization Fix

### Update application.properties

```properties
# Add these lines:
spring.jackson.default-property-inclusion=non-null
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.serialization.indent-output=true
```

### Update Item.java

Add Jackson annotation:

```java
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

public class Item {
    // ... existing fields
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFound;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateLost;
}
```

---

## Priority 3: Fix Response Format

### Option A: Update Backend (Recommended)

Create response DTO:

```java
// ItemListResponse.java
package com.example.findit.dto;

import java.util.List;
import com.example.findit.model.Item;

public class ItemListResponse {
    public List<Item> content;
    
    public ItemListResponse(List<Item> content) {
        this.content = content;
    }
}
```

Update ItemsController:

```java
@GetMapping
public ItemListResponse list(@RequestParam(required = false) Long owner,
                             @RequestParam(required = false) String type) {
    List<Item> items;
    if (owner != null) {
        items = itemService.findByReporterId(owner);
    } else if (type != null) {
        items = itemService.findByType(type);
    } else {
        items = itemService.findAll();
    }
    return new ItemListResponse(items);
}
```

### Option B: Update Frontend API Service

```typescript
list(params?: any) {
    return this.api.get<Item[]>('/items', params).pipe(
        map((items: any) => {
            // Handle both array and {content: array} formats
            return Array.isArray(items) ? items : (items?.content || []);
        }),
        catchError(() => {
            const all = this.readLocal();
            return of(Array.isArray(all) ? all : all.items);
        })
    );
}
```

---

## Priority 4: Basic Authentication Implementation

### Create Auth Controller

Create `backend/src/main/java/com/example/findit/controller/AuthController.java`:

```java
package com.example.findit.controller;

import com.example.findit.model.User;
import com.example.findit.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        
        if (username == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields required"));
        }
        
        if (userService.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        
        User user = userService.register(username, email, password);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        
        Optional<User> user = userService.authenticate(username, password);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
        
        // In production, return JWT token instead
        return ResponseEntity.ok(user.get());
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        // In production, validate JWT token
        // For now, return not authenticated
        return ResponseEntity.status(401).build();
    }
}
```

### Update UserService

```java
package com.example.findit.service;

import com.example.findit.model.User;
import com.example.findit.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String username, String email, String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password); // In production, HASH this!
        user.setRole("user");
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String username, String password) {
        return userRepository.findByUsername(username)
            .filter(u -> u.getPassword().equals(password)); // In production, use proper hashing!
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
```

### Update User Model

```java
package com.example.findit.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String email;
    private String password;
    private String role; // "user" or "admin"

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
```

### Update UserRepository

```java
package com.example.findit.repository;

import com.example.findit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}
```

---

## Priority 5: CORS Configuration

Create `backend/src/main/java/com/example/findit/config/WebConfig.java`:

```java
package com.example.findit.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:4200",
                "http://localhost:3000"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

---

## Priority 6: Input Validation

Update Item.java with validation annotations:

```java
package com.example.findit.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200)
    private String title;
    
    @Size(max = 1000)
    @Column(length = 1000)
    private String description;
    
    @NotNull(message = "Category is required")
    private Integer categoryId;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFound;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateLost;
    
    @Email
    private String reporterContact;
    
    @NotBlank
    @Pattern(regexp = "FOUND|LOST")
    private String type;
    
    private String status; // PENDING, APPROVED, REJECTED
    
    @NotNull
    private Long reporterId;

    // Getters/Setters...
}
```

Update ItemsController POST method:

```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> create(
    @Valid @RequestPart(value = "item") String itemJson,
    @RequestPart(value = "photos", required = false) List<MultipartFile> photos) throws IOException {
    // ... rest of implementation
}
```

---

## Priority 7: Global Exception Handler

Create `backend/src/main/java/com/example/findit/exception/GlobalExceptionHandler.java`:

```java
package com.example.findit.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", ex.getMessage()));
    }
}
```

---

## Frontend Changes

### Add Authentication Interceptor

Create `src/app/core/auth.interceptor.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService, private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Add token if available
        const token = localStorage.getItem('token');
        if (token) {
            req = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
        }

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.auth.logout();
                    this.router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }
}
```

Add to `app.config.ts`:

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};
```

---

## Testing

### Test File Upload
```bash
curl -X POST http://localhost:8080/api/items \
  -F "item='{\"title\":\"Test\",\"location\":\"Library\"}'" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg"
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123"}'
```

---

## Deployment Checklist

- [ ] Update `application.properties` for production database
- [ ] Implement proper password hashing (BCrypt)
- [ ] Implement JWT or OAuth2 authentication
- [ ] Change file upload to cloud storage (S3, Azure, etc.)
- [ ] Add rate limiting
- [ ] Add API logging
- [ ] Configure HTTPS
- [ ] Add monitoring and alerting
- [ ] Create API documentation (Swagger)
- [ ] Add authentication to sensitive endpoints
- [ ] Implement proper error logging
- [ ] Add unit and integration tests

