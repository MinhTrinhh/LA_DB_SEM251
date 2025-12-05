package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bank")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "paymentMethod")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Bank {
    @Id
    @Column(name = "bank_id")
    @EqualsAndHashCode.Include
    private Long bankId;

    @Column(name = "bank_name")
    private String bankName;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "method_id", referencedColumnName = "method_id")
    private PaymentMethod paymentMethod;
}

