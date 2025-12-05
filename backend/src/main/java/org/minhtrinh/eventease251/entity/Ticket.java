package org.minhtrinh.eventease251.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"order", "category"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    @EqualsAndHashCode.Include
    private Long ticketId;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Column(name = "used_flag", nullable = false)
    private boolean usedFlag = false;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private TicketCategory category;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = true)  // Nullable - tickets remain when order is deleted
    private Order order;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
