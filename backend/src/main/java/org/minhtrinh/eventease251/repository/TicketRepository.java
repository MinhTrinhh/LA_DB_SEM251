package org.minhtrinh.eventease251.repository;

import org.minhtrinh.eventease251.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    // Find all tickets for a specific order
    List<Ticket> findByOrder_OrderId(Long orderId);
    
    // Find tickets by QR code URL
    Ticket findByQrCodeUrl(String qrCodeUrl);
    
    // Count tickets for a ticket category
    Long countByCategory_CategoryId(Long categoryId);
}