package org.minhtrinh.eventease251.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.config.PaymentQRCodeConfig;
import org.minhtrinh.eventease251.config.TicketQRCodeConfig;
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

    private final PaymentQRCodeConfig paymentConfig;
    private final TicketQRCodeConfig ticketConfig;

    /**
     * Serve payment/order QR code image file
     * GET /api/qr-codes/orderqr/{filename}
     */
    @GetMapping("/orderqr/{filename}")
    public ResponseEntity<Resource> getOrderQRCode(@PathVariable String filename) {
        try {
            log.info("Serving order/payment QR code: {}", filename);

            // Build path to payment QR code file
            Path qrCodePath = Paths.get(paymentConfig.getQrcode().getStorageDir()).resolve(filename).normalize();
            Resource resource = new UrlResource(qrCodePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.error("Order QR code file not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Return image with appropriate headers
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error serving order QR code {}: {}", filename, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Serve ticket validation QR code image file
     * GET /api/qr-codes/ticketqr/{filename}
     */
    @GetMapping("/ticketqr/{filename}")
    public ResponseEntity<Resource> getTicketQRCode(@PathVariable String filename) {
        try {
            log.info("Serving ticket validation QR code: {}", filename);

            // Build path to ticket QR code file
            Path qrCodePath = Paths.get(ticketConfig.getQrcode().getStorageDir()).resolve(filename).normalize();
            Resource resource = new UrlResource(qrCodePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.error("Ticket QR code file not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Return image with appropriate headers
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error serving ticket QR code {}: {}", filename, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

