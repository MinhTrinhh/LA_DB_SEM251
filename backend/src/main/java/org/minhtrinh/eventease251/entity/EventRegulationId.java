package org.minhtrinh.eventease251.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRegulationId implements Serializable {
    private Long event;
    private String regulation;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EventRegulationId that = (EventRegulationId) o;
        return Objects.equals(event, that.event) && 
               Objects.equals(regulation, that.regulation);
    }

    @Override
    public int hashCode() {
        return Objects.hash(event, regulation);
    }
}
