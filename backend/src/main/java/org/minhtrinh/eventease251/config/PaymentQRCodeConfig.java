package org.minhtrinh.eventease251.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "payment")
@Data
public class PaymentQRCodeConfig {

    private QRCodeConfig qrcode;
    private MBBankConfig mbbank;
    private VietQRConfig vietqr;

    @Data
    public static class QRCodeConfig {
        private String storageDir;
        private Integer width;
        private Integer height;
        private String baseUrl;
    }

    @Data
    public static class MBBankConfig {
        private String accountNo;
        private String accountName;
        private String bankCode;
        private String bankName;
    }

    @Data
    public static class VietQRConfig {
        private String template;
        private String apiUrl;
    }
}

