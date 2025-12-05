package org.minhtrinh.eventease251.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.config.FileUploadConfig;
import org.minhtrinh.eventease251.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for handling file uploads (event posters)
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:20002", "http://127.0.0.1:20002"})
@Slf4j
public class FileUploadController {

    private final FileUploadConfig fileUploadConfig;

    /**
     * Upload event poster
     * Only authenticated organizers can upload posters
     */
    @PostMapping("/upload/poster")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> uploadPoster(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                ErrorResponse error = new ErrorResponse();
                error.setMessage("Please select a file to upload");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate file size
            if (file.getSize() > fileUploadConfig.getMaxFileSize()) {
                ErrorResponse error = new ErrorResponse();
                error.setMessage("File size exceeds maximum limit of " +
                    (fileUploadConfig.getMaxFileSize() / 1024 / 1024) + "MB");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate file type (images only)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                ErrorResponse error = new ErrorResponse();
                error.setMessage("Only image files are allowed (JPG, PNG, GIF, WebP)");
                return ResponseEntity.badRequest().body(error);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path uploadPath = Paths.get(fileUploadConfig.getUploadDir());
            Path filePath = uploadPath.resolve(newFilename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Generate URL path (relative path to store in database)
            String fileUrl = "/uploads/posters/" + newFilename;

            log.info("File uploaded successfully: {}", newFilename);

            // Return response
            Map<String, String> response = new HashMap<>();
            response.put("filename", newFilename);
            response.put("url", fileUrl);
            response.put("originalFilename", originalFilename);
            response.put("size", String.valueOf(file.getSize()));
            response.put("contentType", contentType);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Failed to upload file", e);
            ErrorResponse error = new ErrorResponse();
            error.setMessage("Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Delete event poster
     * Only authenticated organizers can delete posters
     */
    @DeleteMapping("/poster/{filename}")
    @PreAuthorize("hasRole('ROLE_ORGANIZER')")
    public ResponseEntity<?> deletePoster(@PathVariable String filename) {
        try {
            // Don't allow deleting default poster
            if (filename.equals("default-event-poster.jpg")) {
                ErrorResponse error = new ErrorResponse();
                error.setMessage("Cannot delete default poster");
                return ResponseEntity.badRequest().body(error);
            }

            Path filePath = Paths.get(fileUploadConfig.getUploadDir()).resolve(filename);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", filename);

                Map<String, String> response = new HashMap<>();
                response.put("message", "File deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                ErrorResponse error = new ErrorResponse();
                error.setMessage("File not found: " + filename);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

        } catch (IOException e) {
            log.error("Failed to delete file: {}", filename, e);
            ErrorResponse error = new ErrorResponse();
            error.setMessage("Failed to delete file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get default poster URL
     */
    @GetMapping("/poster/default-url")
    public ResponseEntity<?> getDefaultPosterUrl() {
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUploadConfig.getDefaultPosterUrl());
        return ResponseEntity.ok(response);
    }
}

