package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.TicketCategory;
import org.minhtrinh.eventease251.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketCategoryRepository extends JpaRepository<TicketCategory, Long> {
    List<TicketCategory> findBySession(Session session);
}