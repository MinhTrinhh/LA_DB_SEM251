package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_method")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"bank", "eWallet"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "method_id")
    @EqualsAndHashCode.Include
    private Long methodId;

    @Column(name = "charged_fee", precision = 10, scale = 2)
    private BigDecimal chargedFee;

    @Column(name = "fee_payer", length = 50)
    @Enumerated(EnumType.STRING)
    private FeePayer feePayer;

    // One-to-one relationship with Bank
    @OneToOne(mappedBy = "paymentMethod", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Bank bank;

    // One-to-one relationship with E-Wallet
    @OneToOne(mappedBy = "paymentMethod", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private EWallet eWallet;

    /**
     * Helper method to determine the method unit type
     */
    @Transient
    public MethodUnit getMethodUnit() {
        if (bank != null) {
            return MethodUnit.BANK;
        } else if (eWallet != null) {
            return MethodUnit.E_WALLET;
        }
        return null;
    }

    /**
     * Helper method to get the name regardless of type
     */
    @Transient
    public String getMethodName() {
        if (bank != null) {
            return bank.getBankName();
        } else if (eWallet != null) {
            return eWallet.getEWalletName();
        }
        return null;
    }
}

