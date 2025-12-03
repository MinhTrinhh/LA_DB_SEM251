package org.minhtrinh.eventease251.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class SeatId implements Serializable {
    private Long seatId;
    private SeatMap seatMap; // Must match the @Id field type in Seat entity (SeatMap, not Long)
}
