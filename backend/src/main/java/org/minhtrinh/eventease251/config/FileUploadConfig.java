package org.minhtrinh.eventease251.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Configuration for file upload and storage
 * Handles poster images for events
 */
@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Value("${file.upload.dir:uploads/posters}")
    private String uploadDir;

    @Value("${file.upload.max-size:5242880}") // 5MB default
    private long maxFileSize;

    /**
     * Get the upload directory path
     */
    public String getUploadDir() {
        return uploadDir;
    }

    /**
     * Get maximum file size
     */
    public long getMaxFileSize() {
        return maxFileSize;
    }

    /**
     * Create upload directory if it doesn't exist
     */
    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory: " + uploadPath);
            } else {
                System.out.println("Upload directory exists: " + uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    /**
     * Configure resource handler to serve uploaded files
     * This allows public access to uploaded poster images
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        String resourceLocation = "file:" + uploadPath.toString() + "/";

        System.out.println("Configuring resource handler:");
        System.out.println("  Pattern: /uploads/**");
        System.out.println("  Location: " + resourceLocation);

        // Serve uploaded files from /uploads/** URL pattern
        registry.addResourceHandler("/uploads/posters/**")
                .addResourceLocations(resourceLocation);
    }

    /**
     * Get default poster URL
     */
    public String getDefaultPosterUrl() {
        return "/uploads/posters/default-event-poster.png";
    }
}

