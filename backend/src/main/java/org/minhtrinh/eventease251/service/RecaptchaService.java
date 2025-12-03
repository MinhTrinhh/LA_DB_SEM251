package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.RecaptchaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecaptchaService {

    @Value("${recaptcha.secret}")
    private String recaptchaSecret;

    @Value("${recaptcha.verify-url}")
    private String recaptchaVerifyUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Verifies reCAPTCHA token with Google's API
     * @param recaptchaToken The token from frontend
     * @return true if verification successful, false otherwise
     */
    public boolean verifyRecaptcha(String recaptchaToken) {
        if (recaptchaToken == null || recaptchaToken.isEmpty()) {
            log.warn("reCAPTCHA token is null or empty");
            return false;
        }

        try {
            MultiValueMap<String, String> requestMap = new LinkedMultiValueMap<>();
            requestMap.add("secret", recaptchaSecret);
            requestMap.add("response", recaptchaToken);

            RecaptchaResponse response = restTemplate.postForObject(
                recaptchaVerifyUrl,
                requestMap,
                RecaptchaResponse.class
            );

            if (response != null && response.isSuccess()) {
                log.info("reCAPTCHA verification successful");
                return true;
            } else {
                log.warn("reCAPTCHA verification failed: {}",
                    response != null ? response.getErrorCodes() : "null response");
                return false;
            }
        } catch (Exception e) {
            log.error("Error during reCAPTCHA verification", e);
            return false;
        }
    }
}
