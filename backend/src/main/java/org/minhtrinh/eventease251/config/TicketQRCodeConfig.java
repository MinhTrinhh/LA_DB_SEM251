package org.minhtrinh.eventease251.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ticket")
@Data
public class TicketQRCodeConfig {

    private QRCodeConfig qrcode;

    @Data
    public static class QRCodeConfig {
        private String storageDir;  // Ticket validation QR storage
        private String baseUrl;     // Ticket validation QR base URL
    }
}

