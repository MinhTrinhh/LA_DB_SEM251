package org.minhtrinh.eventease251.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class SeatId implements Serializable {
    private Long seatId;
    private Long seatMap; // Must match SeatMap's primary key type (Long seatMapId)
}
