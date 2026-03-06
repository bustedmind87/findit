package com.example.findit.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            // With allowCredentials(true), do not use allowedOrigins("*").
            // Use explicit origins and wildcard host patterns via allowedOriginPatterns.
            .allowedOriginPatterns(
                "http://localhost:4200",
                "http://localhost:3000",
                "http://127.0.0.1:4200",
                "https://*.netlify.app",
                "https://*.netlify.live"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600)
            .exposedHeaders("Content-Disposition", "X-Total-Count", "X-Page-Number");
    }
}

