package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "event_regulation")
@Data
@IdClass(EventRegulationId.class)
public class EventRegulation {
    @Id
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @Id
    @Column(name = "aregulation")
    private String regulation;
}