package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "offline_session")
@Data
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumns({
    @PrimaryKeyJoinColumn(name = "session_id", referencedColumnName = "session_id"),
    @PrimaryKeyJoinColumn(name = "event_id", referencedColumnName = "event_id")
})
public class OfflineSession extends Session {
    @Column(name = "venue_name")
    private String venueName;

    @Column(name = "venue_address")
    private String venueAddress;
}