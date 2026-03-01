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
                "http://localhost:3000",
                "http://127.0.0.1:4200",
                // Netlify deployment URLs - update these with your actual domains
                "https://*.netlify.app",  // Matches all Netlify preview deployments
                "https://*.netlify.live", // Netlify live domain
                // Your custom domain (uncomment and update)
                // "https://yourdomain.com",
                // "https://www.yourdomain.com"
                "*" // Warning: Use only for development, NOT for production
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600)
            .exposedHeaders("Content-Disposition", "X-Total-Count", "X-Page-Number");
    }
}

