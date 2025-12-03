package org.minhtrinh.eventease251.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "seat_map")
@Data
public class SeatMap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_map_id")
    private Long seatMapId;

    @Column(name = "seat_map_url")
    private String seatMapUrl;
}