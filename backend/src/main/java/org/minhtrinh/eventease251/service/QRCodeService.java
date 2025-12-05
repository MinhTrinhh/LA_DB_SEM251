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
import org.minhtrinh.eventease251.config.PaymentQRCodeConfig;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class QRCodeService {

    private final PaymentQRCodeConfig config;

    /**
     * Generate VietQR standard QR code for bank transfer
     * Format: Bank Code|Account Number|Account Name|Amount|Description|Template
     */
    public String generateVietQRCode(Long orderId, BigDecimal amount, String description) {
        try {
            // Ensure QR code directory exists
            Path qrCodeDir = Paths.get(config.getQrcode().getStorageDir());
            if (!Files.exists(qrCodeDir)) {
                Files.createDirectories(qrCodeDir);
                log.info("Created QR code directory: {}", qrCodeDir.toAbsolutePath());
            }

            // Generate VietQR format string
            // Format: {bankBin}|{accountNo}|{accountName}|{amount}|{description}|{template}
            String qrContent = generateVietQRContent(orderId, amount, description);

            // Generate QR code filename
            String fileName = String.format("order_%d_%d.png", orderId, System.currentTimeMillis());
            Path qrCodePath = qrCodeDir.resolve(fileName);

            // Generate and save QR code
            generateQRCodeImage(qrContent, qrCodePath);

            // Return the URL to access the QR code
            String qrCodeUrl = String.format("%s/%s", config.getQrcode().getBaseUrl(), fileName);
            log.info("Generated VietQR code for order {}: {}", orderId, qrCodeUrl);

            return qrCodeUrl;

        } catch (IOException | WriterException e) {
            log.error("Failed to generate QR code for order {}: {}", orderId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate payment QR code", e);
        }
    }

    /**
     * Generate VietQR content string using EMVCo QR Code format
     * STRICT MODE: Fully offline, no APIs.
     */
    private String generateVietQRContent(Long orderId, BigDecimal amount, String description) {

        // IMPORTANT: You MUST use the Bank BIN (Numeric), NOT the Bank Name.
        // MBBank BIN is 970422. Vietcombank is 970436, etc.
        // If config.getMbbank().getBankCode() returns "MBBANK", this will FAIL.
        // It must return "970422".
        String bankBin = config.getMbbank().getBankCode();
        String accountNo = config.getMbbank().getAccountNo();
        String amountStr = amount.setScale(0, RoundingMode.HALF_UP).toString();

        // 1. Setup Basic Tags
        StringBuilder qrContent = new StringBuilder();
        qrContent.append("000201"); // Payload Format
        qrContent.append("010212"); // Point of Initiation (12 = Dynamic/One-time)

        // 2. Build Tag 38 (Merchant Account Information)
        // This is where your previous code failed. It requires specific nesting.
        StringBuilder tag38Value = new StringBuilder();

        // 2.a. GUID (Tag 00)
        String guid = "A000000727";
        tag38Value.append("00").append(String.format("%02d", guid.length())).append(guid);

        // 2.b. Payment Network Specific (Tag 01) - The Nested Object
        StringBuilder tag01Value = new StringBuilder();

        // Inside Tag 01: Bank BIN (Tag 00)
        tag01Value.append("00").append(String.format("%02d", bankBin.length())).append(bankBin);

        // Inside Tag 01: Account Number (Tag 01)
        tag01Value.append("01").append(String.format("%02d", accountNo.length())).append(accountNo);

        // Append Tag 01 to Tag 38
        String tag01Str = tag01Value.toString();
        tag38Value.append("01").append(String.format("%02d", tag01Str.length())).append(tag01Str);

        // 2.c. Service Code (Tag 02)
        String serviceCode = "QRIBFTTA"; // Fast Transfer 24/7
        tag38Value.append("02").append(String.format("%02d", serviceCode.length())).append(serviceCode);

        // Add the fully built Tag 38 to main content
        String tag38Str = tag38Value.toString();
        qrContent.append("38").append(String.format("%02d", tag38Str.length())).append(tag38Str);

        // 3. Currency (VND = 704)
        qrContent.append("5303704");

        // 4. Amount (Tag 54)
        qrContent.append("54").append(String.format("%02d", amountStr.length())).append(amountStr);

        // 5. Country (Tag 58)
        qrContent.append("5802VN");

        // 6. Additional Data (Tag 62) - Description
        // Note: Clean special characters carefully.
        // Some bank apps crash if they see characters they don't expect here.
        String cleanDescription = description == null ? "" : description.replaceAll("[^a-zA-Z0-9 ]", "").trim();

        if (!cleanDescription.isEmpty()) {
            StringBuilder tag62Value = new StringBuilder();
            // Purpose (Tag 08)
            tag62Value.append("08").append(String.format("%02d", cleanDescription.length())).append(cleanDescription);

            String tag62Str = tag62Value.toString();
            qrContent.append("62").append(String.format("%02d", tag62Str.length())).append(tag62Str);
        }

        // 7. CRC Checksum (Tag 63)
        qrContent.append("6304"); // "63" + length "04"

        // Calculate and append CRC
        String crc = calculateCRC16(qrContent.toString());
        qrContent.append(crc);

        log.info("Generated Raw QR String: {}", qrContent.toString());
        return qrContent.toString();
    }
    /**
     * Calculate CRC16-CCITT checksum for VietQR
     */
    private String calculateCRC16(String data) {
        int crc = 0xFFFF;
        byte[] bytes = data.getBytes();

        for (byte b : bytes) {
            crc ^= (b & 0xFF) << 8;
            for (int i = 0; i < 8; i++) {
                if ((crc & 0x8000) != 0) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
            }
        }

        crc &= 0xFFFF;
        return String.format("%04X", crc);
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

        int width = config.getQrcode().getWidth();
        int height = config.getQrcode().getHeight();

        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);

        // Write to file
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", outputPath);

        log.debug("QR code image saved to: {}", outputPath.toAbsolutePath());
    }

    /**
     * Generate simple payment description for order
     */
    public String generatePaymentDescription(Long orderId) {
        return String.format("ORDER%d", orderId);
    }

    /**
     * Delete QR code file when order is cancelled or expired
     */
    public void deleteQRCode(String qrCodeUrl) {
        try {
            if (qrCodeUrl == null || qrCodeUrl.isEmpty()) {
                return;
            }

            // Extract filename from URL
            String fileName = qrCodeUrl.substring(qrCodeUrl.lastIndexOf('/') + 1);
            Path qrCodePath = Paths.get(config.getQrcode().getStorageDir()).resolve(fileName);

            if (Files.exists(qrCodePath)) {
                Files.delete(qrCodePath);
                log.info("Deleted QR code file: {}", fileName);
            }
        } catch (IOException e) {
            log.error("Failed to delete QR code file: {}", qrCodeUrl, e);
        }
    }

    /**
     * Get the absolute path for QR code directory
     */
    public Path getQRCodeDirectory() {
        return Paths.get(config.getQrcode().getStorageDir()).toAbsolutePath();
    }
}

