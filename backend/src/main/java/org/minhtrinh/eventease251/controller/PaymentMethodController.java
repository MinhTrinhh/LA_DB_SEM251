package org.minhtrinh.eventease251.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.BankDTO;
import org.minhtrinh.eventease251.dto.EWalletDTO;
import org.minhtrinh.eventease251.dto.PaymentMethodDTO;
import org.minhtrinh.eventease251.service.PaymentMethodService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    /**
     * Get all available payment methods (banks and e-wallets combined)
     * GET /api/payment-methods
     */
    @GetMapping
    public ResponseEntity<List<PaymentMethodDTO>> getAllPaymentMethods() {
        log.info("GET /api/payment-methods - Fetching all payment methods");
        List<PaymentMethodDTO> paymentMethods = paymentMethodService.getAllPaymentMethods();
        return ResponseEntity.ok(paymentMethods);
    }

    /**
     * Get all banks
     * GET /api/payment-methods/banks
     */
    @GetMapping("/banks")
    public ResponseEntity<List<BankDTO>> getAllBanks() {
        log.info("GET /api/payment-methods/banks - Fetching all banks");
        List<BankDTO> banks = paymentMethodService.getAllBanks();
        return ResponseEntity.ok(banks);
    }

    /**
     * Get all e-wallets
     * GET /api/payment-methods/e-wallets
     */
    @GetMapping("/e-wallets")
    public ResponseEntity<List<EWalletDTO>> getAllEWallets() {
        log.info("GET /api/payment-methods/e-wallets - Fetching all e-wallets");
        List<EWalletDTO> eWallets = paymentMethodService.getAllEWallets();
        return ResponseEntity.ok(eWallets);
    }
}

