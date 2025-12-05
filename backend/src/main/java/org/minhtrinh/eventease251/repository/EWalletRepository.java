package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.EWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EWalletRepository extends JpaRepository<EWallet, Long> {

    @Query("SELECT e FROM EWallet e JOIN FETCH e.paymentMethod")
    List<EWallet> findAllWithPaymentMethod();

    @Query("SELECT e FROM EWallet e JOIN FETCH e.paymentMethod pm WHERE pm.methodId = :methodId")
    Optional<EWallet> findByPaymentMethodId(@Param("methodId") Long methodId);
}

