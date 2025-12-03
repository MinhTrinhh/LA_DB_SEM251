package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.Seat;
import org.minhtrinh.eventease251.entity.SeatId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeatRepository extends JpaRepository<Seat, SeatId> {
}