package org.minhtrinh.eventease251.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class UseId implements Serializable {
    private SessionId session; // Session has composite key, so use SessionId
    private Long seatMap; // Must match SeatMap's primary key type (Long seatMapId)
}