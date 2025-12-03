package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "seat")
@Data
@IdClass(SeatId.class)
public class Seat {
    @Id
    @Column(name = "seat_id")
    private Long seatId; // Manually assigned seat ID within a seat map

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_map_id")
    private SeatMap seatMap; // Part of composite PK

    @Column(name = "section_number")
    private String sectionNumber;

    @Column(name = "row_number")
    private String rowNumber;

    @Column(name = "seat_number")
    private String seatNumber;
}