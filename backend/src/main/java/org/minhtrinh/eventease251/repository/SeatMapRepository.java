package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.SeatMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeatMapRepository extends JpaRepository<SeatMap, Long> {
}