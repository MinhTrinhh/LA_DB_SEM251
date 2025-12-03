package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "agreement_term")
@Data
@IdClass(AgreementTermId.class)
public class AgreementTerm {
    @Id
    @ManyToOne
    @JoinColumn(name = "ticket_category_id")
    private TicketCategory ticketCategory;

    @Id
    @Column(name = "aterm")
    private String term;
}