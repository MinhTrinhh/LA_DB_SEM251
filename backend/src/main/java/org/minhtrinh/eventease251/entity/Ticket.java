package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "TICKET")
@Data
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Ticket_ID")
    private Long ticketId;

    @Column(name = "QR_Code_URL")
    private String qrCodeUrl;

    @Column(name = "Used_flag")
    private Boolean usedFlag;

    @ManyToOne
    @JoinColumn(name = "Category_ID")
    private TicketCategory category;

    @ManyToOne
    @JoinColumn(name = "Order_ID")
    private Order order;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}