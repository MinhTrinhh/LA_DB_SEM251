package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "e_wallet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "paymentMethod")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EWallet {
    @Id
    @Column(name = "e_wallet_id")
    @EqualsAndHashCode.Include
    private Long eWalletId;

    @Column(name = "e_wallet_name")
    private String eWalletName;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "method_id", referencedColumnName = "method_id")
    private PaymentMethod paymentMethod;
}

