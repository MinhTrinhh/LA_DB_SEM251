package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.TicketCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketCategoryRepository extends JpaRepository<TicketCategory, Long> {
}