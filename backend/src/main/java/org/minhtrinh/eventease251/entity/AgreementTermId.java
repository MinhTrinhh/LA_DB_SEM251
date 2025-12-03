package org.minhtrinh.eventease251.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgreementTermId implements Serializable {
    private Long ticketCategory;
    private String term;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AgreementTermId that = (AgreementTermId) o;
        return Objects.equals(ticketCategory, that.ticketCategory) &&
               Objects.equals(term, that.term);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ticketCategory, term);
    }
}

