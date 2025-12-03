package org.minhtrinh.eventease251.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class SessionId implements Serializable {
    private Long sessionId;
    private Event event; // Must match the @Id field type in Session entity (Event object, not Long)
}
