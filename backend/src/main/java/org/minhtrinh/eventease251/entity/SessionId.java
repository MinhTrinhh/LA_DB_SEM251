package org.minhtrinh.eventease251.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class SessionId implements Serializable {
    private Long sessionId;
    private Long event; // Must match Event's primary key type (Long eventId)
}
