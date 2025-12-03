package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_category")
@Data
public class TicketCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "maximum_slot")
    private Integer maximumSlot;

    @Column(name = "start_date_time")
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time")
    private LocalDateTime endDateTime;

    // Composite FK to session (session_id, event_id)
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "session_id", referencedColumnName = "session_id"),
        @JoinColumn(name = "event_id", referencedColumnName = "event_id")
    })
    private Session session;
}