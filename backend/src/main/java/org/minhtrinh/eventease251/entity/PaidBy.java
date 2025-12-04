package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "paid_by")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"order", "paymentMethod"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PaidBy {
    @Id
    @Column(name = "order_id")
    @EqualsAndHashCode.Include
    private Long orderId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "method_id")
    private PaymentMethod paymentMethod;

    @Column(name = "qr_code_url", length = 500)
    private String qrCodeUrl;

    @Column(name = "transaction_id", insertable = false, updatable = false)
    private Long transactionId;

    @Column(name = "timestamp", columnDefinition = "DATETIME2")
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}

