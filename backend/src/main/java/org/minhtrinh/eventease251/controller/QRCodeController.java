package org.minhtrinh.eventease251.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.config.PaymentQRCodeConfig;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/qr-codes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class QRCodeController {

    private final PaymentQRCodeConfig config;

    /**
     * Serve QR code image file
     * GET /api/qr-codes/{filename}
     */
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getQRCode(@PathVariable String filename) {
        try {
            log.info("Serving QR code: {}", filename);

            // Build path to QR code file
            Path qrCodePath = Paths.get(config.getQrcode().getStorageDir()).resolve(filename).normalize();
            Resource resource = new UrlResource(qrCodePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.error("QR code file not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Return image with appropriate headers
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error serving QR code {}: {}", filename, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

