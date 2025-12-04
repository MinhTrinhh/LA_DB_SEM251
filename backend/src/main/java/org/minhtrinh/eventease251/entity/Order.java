package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "[order]")  // Using brackets for SQL Server reserved keyword
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"participantProfile", "tickets"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    @EqualsAndHashCode.Include
    private Long orderId;

    @Column(name = "order_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus = OrderStatus.AWAITING_PAYMENT;

    @Column(name = "currency")
    @Enumerated(EnumType.STRING)
    private OrderCurrency currency = OrderCurrency.VND;

    @Column(name = "amount_of_money")
    private BigDecimal amountOfMoney;

    // References ParticipantProfile (user_id references participant_profile.user_id)
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private ParticipantProfile participantProfile;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<Ticket> tickets;
}