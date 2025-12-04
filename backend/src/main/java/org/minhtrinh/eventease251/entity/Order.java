package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "`ORDER`")  // Using backticks because ORDER is a reserved SQL keyword
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Order_ID")
    private Long orderId;

    @Column(name = "Order_Status")
    private String orderStatus;

    @Column(name = "Currency")
    private String currency;

    @Column(name = "Amount_of_Money")
    private BigDecimal amountOfMoney;

    // Changed from Participant to User (who has ParticipantProfile)
    @ManyToOne
    @JoinColumn(name = "User_ID", referencedColumnName = "User_ID")
    private User participant;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<Ticket> tickets;
}