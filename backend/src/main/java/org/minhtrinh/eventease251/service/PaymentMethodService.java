package org.minhtrinh.eventease251.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.eventease251.dto.BankDTO;
import org.minhtrinh.eventease251.dto.EWalletDTO;
import org.minhtrinh.eventease251.dto.PaymentMethodDTO;
import org.minhtrinh.eventease251.entity.Bank;
import org.minhtrinh.eventease251.entity.EWallet;
import org.minhtrinh.eventease251.entity.MethodUnit;
import org.minhtrinh.eventease251.entity.PaymentMethod;
import org.minhtrinh.eventease251.repository.BankRepository;
import org.minhtrinh.eventease251.repository.EWalletRepository;
import org.minhtrinh.eventease251.repository.PaymentMethodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final BankRepository bankRepository;
    private final EWalletRepository eWalletRepository;

    /**
     * Get all available payment methods (banks and e-wallets)
     */
    @Transactional(readOnly = true)
    public List<PaymentMethodDTO> getAllPaymentMethods() {
        log.info("Fetching all payment methods");

        List<PaymentMethodDTO> paymentMethods = new ArrayList<>();

        // Get all banks with their payment methods
        List<Bank> banks = bankRepository.findAllWithPaymentMethod();
        for (Bank bank : banks) {
            PaymentMethodDTO dto = new PaymentMethodDTO();
            dto.setMethodId(bank.getPaymentMethod().getMethodId());
            dto.setChargedFee(bank.getPaymentMethod().getChargedFee());
            dto.setFeePayer(bank.getPaymentMethod().getFeePayer().name());
            dto.setType(MethodUnit.BANK.name());
            dto.setName(bank.getBankName());
            paymentMethods.add(dto);
        }

        // Get all e-wallets with their payment methods
        List<EWallet> eWallets = eWalletRepository.findAllWithPaymentMethod();
        for (EWallet eWallet : eWallets) {
            PaymentMethodDTO dto = new PaymentMethodDTO();
            dto.setMethodId(eWallet.getPaymentMethod().getMethodId());
            dto.setChargedFee(eWallet.getPaymentMethod().getChargedFee());
            dto.setFeePayer(eWallet.getPaymentMethod().getFeePayer().name());
            dto.setType(MethodUnit.E_WALLET.name());
            dto.setName(eWallet.getEWalletName());
            paymentMethods.add(dto);
        }

        log.info("Found {} payment methods ({} banks, {} e-wallets)",
                paymentMethods.size(), banks.size(), eWallets.size());
        return paymentMethods;
    }

    /**
     * Get all banks with their payment method details
     */
    @Transactional(readOnly = true)
    public List<BankDTO> getAllBanks() {
        log.info("Fetching all banks");

        List<Bank> banks = bankRepository.findAllWithPaymentMethod();
        List<BankDTO> bankDTOs = new ArrayList<>();

        for (Bank bank : banks) {
            BankDTO dto = new BankDTO();
            dto.setBankId(bank.getBankId());
            dto.setBankName(bank.getBankName());
            dto.setMethodId(bank.getPaymentMethod().getMethodId());
            dto.setChargedFee(bank.getPaymentMethod().getChargedFee());
            dto.setFeePayer(bank.getPaymentMethod().getFeePayer().name());
            bankDTOs.add(dto);
        }

        log.info("Found {} banks", bankDTOs.size());
        return bankDTOs;
    }

    /**
     * Get all e-wallets with their payment method details
     */
    @Transactional(readOnly = true)
    public List<EWalletDTO> getAllEWallets() {
        log.info("Fetching all e-wallets");

        List<EWallet> eWallets = eWalletRepository.findAllWithPaymentMethod();
        List<EWalletDTO> eWalletDTOs = new ArrayList<>();

        for (EWallet eWallet : eWallets) {
            EWalletDTO dto = new EWalletDTO();
            dto.setEWalletId(eWallet.getEWalletId());
            dto.setEWalletName(eWallet.getEWalletName());
            dto.setMethodId(eWallet.getPaymentMethod().getMethodId());
            dto.setChargedFee(eWallet.getPaymentMethod().getChargedFee());
            dto.setFeePayer(eWallet.getPaymentMethod().getFeePayer().name());
            eWalletDTOs.add(dto);
        }

        log.info("Found {} e-wallets", eWalletDTOs.size());
        return eWalletDTOs;
    }

    /**
     * Convert PaymentMethod to DTO with type and name information
     */
    public PaymentMethodDTO convertToDTO(PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            return null;
        }

        PaymentMethodDTO dto = new PaymentMethodDTO();
        dto.setMethodId(paymentMethod.getMethodId());
        dto.setChargedFee(paymentMethod.getChargedFee());
        dto.setFeePayer(paymentMethod.getFeePayer().name());

        // Find bank or e-wallet
        bankRepository.findByPaymentMethodId(paymentMethod.getMethodId()).ifPresentOrElse(
            bank -> {
                dto.setType(MethodUnit.BANK.name());
                dto.setName(bank.getBankName());
            },
            () -> {
                eWalletRepository.findByPaymentMethodId(paymentMethod.getMethodId()).ifPresent(
                    wallet -> {
                        dto.setType(MethodUnit.E_WALLET.name());
                        dto.setName(wallet.getEWalletName());
                    }
                );
            }
        );

        return dto;
    }
}

