package org.minhtrinh.eventease251.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.config.TicketQRCodeConfig;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketQRCodeService {

    private final TicketQRCodeConfig config;

    /**
     * Generate ticket validation QR code
     * This QR code is used for check-in/validation at event entrance
     * Format: TICKET-{orderId}-{categoryId}-{index}-{uuid}
     */
    public String generateTicketQRCode(Long orderId, Long categoryId, int ticketIndex) {
        try {
            // Ensure ticket QR code directory exists
            Path qrCodeDir = Paths.get(config.getQrcode().getStorageDir());
            if (!Files.exists(qrCodeDir)) {
                Files.createDirectories(qrCodeDir);
                log.info("Created ticket QR code directory: {}", qrCodeDir.toAbsolutePath());
            }

            // Generate unique token for this ticket
            String uniqueToken = UUID.randomUUID().toString();

            // Generate ticket validation string
            String ticketContent = String.format("TICKET-%d-%d-%d-%s",
                orderId, categoryId, ticketIndex, uniqueToken);

            // Generate QR code filename
            String fileName = String.format("ticket_%d_%d_%d_%d.png",
                orderId, categoryId, ticketIndex, System.currentTimeMillis());
            Path qrCodePath = qrCodeDir.resolve(fileName);

            // Generate and save QR code image
            generateQRCodeImage(ticketContent, qrCodePath);

            // Return the URL to access the ticket QR code
            String qrCodeUrl = String.format("%s/%s", config.getQrcode().getBaseUrl(), fileName);
            log.info("Generated ticket validation QR code for order {} ticket {}: {}",
                orderId, ticketIndex, qrCodeUrl);

            return qrCodeUrl;

        } catch (IOException | WriterException e) {
            log.error("Failed to generate ticket QR code for order {} ticket {}: {}",
                orderId, ticketIndex, e.getMessage(), e);
            throw new RuntimeException("Failed to generate ticket QR code", e);
        }
    }

    /**
     * Generate QR code image and save to file
     */
    private void generateQRCodeImage(String content, Path outputPath) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);

        // Use standard size for ticket QR codes (300x300)
        int width = 300;
        int height = 300;

        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);

        // Write to file
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", outputPath);

        log.debug("Ticket QR code image saved to: {}", outputPath.toAbsolutePath());
    }

    /**
     * Delete ticket QR code file
     */
    public void deleteTicketQRCode(String qrCodeUrl) {
        try {
            if (qrCodeUrl == null || qrCodeUrl.isEmpty()) {
                return;
            }

            // Extract filename from URL
            String fileName = qrCodeUrl.substring(qrCodeUrl.lastIndexOf('/') + 1);
            Path qrCodePath = Paths.get(config.getQrcode().getStorageDir()).resolve(fileName);

            if (Files.exists(qrCodePath)) {
                Files.delete(qrCodePath);
                log.info("Deleted ticket QR code file: {}", fileName);
            }
        } catch (IOException e) {
            log.error("Failed to delete ticket QR code file: {}", qrCodeUrl, e);
        }
    }

    /**
     * Get the absolute path for ticket QR code directory
     */
    public Path getTicketQRCodeDirectory() {
        return Paths.get(config.getQrcode().getStorageDir()).toAbsolutePath();
    }
}

