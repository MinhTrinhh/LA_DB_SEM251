package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.AgreementTerm;
import org.minhtrinh.eventease251.entity.AgreementTermId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgreementTermRepository extends JpaRepository<AgreementTerm, AgreementTermId> {
}