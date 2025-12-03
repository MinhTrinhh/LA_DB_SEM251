package org.minhtrinh.eventease251.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class UseId implements Serializable {
    private Session session; // Must match the @Id field type in Use entity
    private SeatMap seatMap; // Must match the @Id field type in Use entity
}