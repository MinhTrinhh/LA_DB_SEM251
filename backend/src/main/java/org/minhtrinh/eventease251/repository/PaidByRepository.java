package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.PaidBy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaidByRepository extends JpaRepository<PaidBy, Long> {

    @Query("SELECT p FROM PaidBy p JOIN FETCH p.order JOIN FETCH p.paymentMethod WHERE p.orderId = :orderId")
    Optional<PaidBy> findByOrderIdWithDetails(@Param("orderId") Long orderId);

    Optional<PaidBy> findByOrderId(Long orderId);
}

