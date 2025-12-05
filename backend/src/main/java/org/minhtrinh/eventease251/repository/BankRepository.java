package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.Bank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankRepository extends JpaRepository<Bank, Long> {

    @Query("SELECT b FROM Bank b JOIN FETCH b.paymentMethod")
    List<Bank> findAllWithPaymentMethod();

    @Query("SELECT b FROM Bank b JOIN FETCH b.paymentMethod pm WHERE pm.methodId = :methodId")
    Optional<Bank> findByPaymentMethodId(@Param("methodId") Long methodId);
}

