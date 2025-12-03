package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "[use]") // use is reserved keyword in SQL
@Data
@IdClass(UseId.class)
public class Use {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "session_id", referencedColumnName = "session_id"),
        @JoinColumn(name = "event_id", referencedColumnName = "event_id")
    })
    private Session session; // Part of composite PK

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_map_id")
    private SeatMap seatMap; // Part of composite PK
}