package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "session")
@Data
@Inheritance(strategy = InheritanceType.JOINED)
@IdClass(SessionId.class)
public class Session {
    @Id
    @Column(name = "session_id")
    private Long sessionId; // Manually assigned - composite keys cannot be auto-generated

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(name = "start_date_time")
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time")
    private LocalDateTime endDateTime;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "type")
    private String type; // ONLINE or OFFLINE
}