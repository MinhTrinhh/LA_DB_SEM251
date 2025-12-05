package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "event")
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "title")
    private String title;

    @Column(name = "general_introduction", columnDefinition = "NVARCHAR(MAX)")
    private String generalIntroduction;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_status")
    private EventStatus eventStatus;

    // References OrganizerProfile (organizer_id references organizer_profile.user_id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", referencedColumnName = "user_id", nullable = false)
    private OrganizerProfile organizerProfile;

    @Column(name = "start_date_time")
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time")
    private LocalDateTime endDateTime;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "poster_url")
    private String posterUrl;
}